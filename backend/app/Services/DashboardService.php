<?php

namespace App\Services;

use App\Models\Account;
use App\Models\Transaction;
use App\Models\Goal;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;

class DashboardService
{
    private const TTL = 300; // 5 minutes

    private function cacheKey(string $type, int $userId, mixed ...$params): string
    {
        return 'dashboard_' . $type . '_' . $userId . '_' . implode('_', $params);
    }

    public function clearUserCache(int $userId): void
    {
        $now = now();
        foreach (range(-1, 1) as $monthOffset) {
            $date = $now->copy()->addMonths($monthOffset);
            foreach (['summary', 'pie', 'member'] as $type) {
                Cache::forget($this->cacheKey($type, $userId, $date->month, $date->year));
                Cache::forget($this->cacheKey($type, $userId, $date->month, $date->year, 0));
            }
        }
        foreach (range(-1, 1) as $yearOffset) {
            Cache::forget($this->cacheKey('bar', $userId, $now->year + $yearOffset));
        }
        Cache::forget($this->cacheKey('line', $userId, 6));
        Cache::forget("user_{$userId}_insight_monthly_comp");
        Cache::forget("user_{$userId}_insight_savings_rate");
        Cache::forget("user_{$userId}_insight_expense_anomaly");
        Cache::forget("user_{$userId}_insight_highest_day");
        Cache::forget("user_{$userId}_insight_weekend_vs_weekday");
        Cache::forget("networth_current_{$userId}");
        Cache::forget("networth_history_{$userId}");
    }

    public function getSummary(int $userId, ?int $month = null, ?int $year = null): array
    {
        $month = $month ?? now()->month;
        $year  = $year  ?? now()->year;

        return Cache::remember($this->cacheKey('summary', $userId, $month, $year), self::TTL, function () use ($userId, $month, $year) {
            $monthlyTotals = Transaction::where('user_id', $userId)
                ->whereIn('type', ['income', 'expense'])
                ->where('transfer_id', null)
                ->whereMonth('transaction_date', $month)
                ->whereYear('transaction_date', $year)
                ->selectRaw('type, SUM(amount) as total')
                ->groupBy('type')
                ->pluck('total', 'type');

            $income  = (float) ($monthlyTotals['income']  ?? 0);
            $expense = (float) ($monthlyTotals['expense'] ?? 0);

            $totalBalance = Account::where('user_id', $userId)
                ->where('is_active', true)
                ->sum('balance');

            $activeGoals = Goal::where('user_id', $userId)
                ->where('status', 'active')
                ->count();

            return [
                'total_balance'   => (float) $totalBalance,
                'monthly_income'  => $income,
                'monthly_expense' => $expense,
                'monthly_net'     => $income - $expense,
                'active_goals'    => $activeGoals,
                'month'           => $month,
                'year'            => $year,
            ];
        });
    }

    public function getExpenseByCategory(int $userId, ?int $month = null, ?int $year = null, ?int $memberId = null): array
    {
        if ($month === null) $month = now()->month;
        $year  = $year  ?? now()->year;

        return Cache::remember($this->cacheKey('pie', $userId, $month, $year, (int) $memberId), self::TTL, function () use ($userId, $month, $year, $memberId) {
            $query = Transaction::where('user_id', $userId)
                ->where('type', 'expense')
                ->where('transfer_id', null)
                ->whereYear('transaction_date', $year)
                ->whereNotNull('category_id');

            if ($month > 0) {
                $query->whereMonth('transaction_date', $month);
            }

            if ($memberId) {
                $query->where('member_id', $memberId);
            }

            return $query
                ->selectRaw('category_id, SUM(amount) as total')
                ->groupBy('category_id')
                ->with('category:id,name,color,icon')
                ->get()
                ->map(fn ($item) => [
                    'category' => $item->category->name ?? 'Uncategorized',
                    'color'    => $item->category->color ?? '#6c757d',
                    'total'    => (float) $item->total,
                ])
                ->toArray();
        });
    }

    public function getExpenseByMember(int $userId, ?int $month = null, ?int $year = null, ?int $memberId = null): array
    {
        if ($month === null) $month = now()->month;
        $year  = $year  ?? now()->year;

        return Cache::remember($this->cacheKey('member', $userId, $month, $year, (int) $memberId), self::TTL, function () use ($userId, $month, $year, $memberId) {
            $query = Transaction::where('user_id', $userId)
                ->where('type', 'expense')
                ->where('transfer_id', null)
                ->whereYear('transaction_date', $year)
                ->whereNotNull('member_id');

            if ($month > 0) {
                $query->whereMonth('transaction_date', $month);
            }

            if ($memberId) {
                $query->where('member_id', $memberId);
            }

            return $query
                ->selectRaw('member_id, SUM(amount) as total')
                ->groupBy('member_id')
                ->with('member:id,name')
                ->get()
                ->map(function ($item, $index) {
                    $colors = ['#0d6efd', '#6f42c1', '#d63384', '#fd7e14', '#20c997', '#0dcaf0'];
                    return [
                        'member' => $item->member->name ?? 'Unknown',
                        'color'  => $colors[$index % count($colors)],
                        'total'  => (float) $item->total,
                    ];
                })
                ->toArray();
        });
    }

    public function getIncomeVsExpense(int $userId, ?int $year = null): array
    {
        $year = $year ?? now()->year;

        return Cache::remember($this->cacheKey('bar', $userId, $year), self::TTL, function () use ($userId, $year) {
            $rows = Transaction::where('user_id', $userId)
                ->whereIn('type', ['income', 'expense'])
                ->where('transfer_id', null)
                ->whereYear('transaction_date', $year)
                ->selectRaw('EXTRACT(MONTH FROM transaction_date) as m, type, SUM(amount) as total')
                ->groupByRaw('EXTRACT(MONTH FROM transaction_date), type')
                ->get()
                ->groupBy('m');

            $data = [];
            for ($m = 1; $m <= 12; $m++) {
                $monthRows = $rows->get($m, collect());
                $income  = (float) ($monthRows->firstWhere('type', 'income')?->total  ?? 0);
                $expense = (float) ($monthRows->firstWhere('type', 'expense')?->total ?? 0);

                $data[] = [
                    'month'   => Carbon::create($year, $m, 1)->format('M'),
                    'income'  => $income,
                    'expense' => $expense,
                ];
            }

            return $data;
        });
    }

    public function getMonthlyExpenseTrend(int $userId, int $months = 6): array
    {
        return Cache::remember($this->cacheKey('line', $userId, $months), self::TTL, function () use ($userId, $months) {
            $now   = now();
            $start = $now->copy()->subMonths($months - 1)->startOfMonth();

            $rows = Transaction::where('user_id', $userId)
                ->where('type', 'expense')
                ->where('transfer_id', null)
                ->where('transaction_date', '>=', $start)
                ->selectRaw('EXTRACT(YEAR FROM transaction_date) as y, EXTRACT(MONTH FROM transaction_date) as m, SUM(amount) as total')
                ->groupByRaw('EXTRACT(YEAR FROM transaction_date), EXTRACT(MONTH FROM transaction_date)')
                ->get()
                ->keyBy(fn ($r) => $r->y . '-' . $r->m);

            $data = [];
            for ($i = $months - 1; $i >= 0; $i--) {
                $date = $now->copy()->subMonths($i);
                $key  = $date->year . '-' . $date->month;

                $data[] = [
                    'month'   => $date->format('M Y'),
                    'expense' => (float) ($rows->get($key)?->total ?? 0),
                ];
            }

            return $data;
        });
    }
}
