<?php

namespace App\Services;

use App\Models\Transaction;
use App\Models\Budget;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class InsightService
{
    public function getMonthlyComparison(int $userId): ?string
    {
        return Cache::remember("user_{$userId}_insight_monthly_comp", now()->addMinutes(30), function () use ($userId) {
            $currentMonth = Carbon::now()->startOfMonth();
            $lastMonth = Carbon::now()->subMonth()->startOfMonth();

            $currentExpense = Transaction::where('user_id', $userId)
                ->where('type', 'expense')
                ->whereNull('transfer_id')
                ->whereMonth('transaction_date', $currentMonth->month)
                ->whereYear('transaction_date', $currentMonth->year)
                ->sum('amount');

            $lastExpense = Transaction::where('user_id', $userId)
                ->where('type', 'expense')
                ->whereNull('transfer_id')
                ->whereMonth('transaction_date', $lastMonth->month)
                ->whereYear('transaction_date', $lastMonth->year)
                ->sum('amount');

            if ($lastExpense == 0) {
                return null;
            }

            $diff = $currentExpense - $lastExpense;
            $pct = round((abs($diff) / $lastExpense) * 100);

            if ($diff > 0) {
                return "📈 Spending up {$pct}% vs last month.";
            } elseif ($diff < 0) {
                return "📉 Spending down {$pct}% vs last month. 👍";
            }

            return "Spending unchanged vs last month.";
        });
    }

    public function getSavingsRate(int $userId): ?string
    {
        return Cache::remember("user_{$userId}_insight_savings_rate", now()->addMinutes(30), function () use ($userId) {
            $month = Carbon::now()->month;
            $year = Carbon::now()->year;

            $income = Transaction::where('user_id', $userId)->where('type', 'income')->whereNull('transfer_id')->whereMonth('transaction_date', $month)->whereYear('transaction_date', $year)->sum('amount');
            $expense = Transaction::where('user_id', $userId)->where('type', 'expense')->whereNull('transfer_id')->whereMonth('transaction_date', $month)->whereYear('transaction_date', $year)->sum('amount');

            if ($income == 0) {
                return null;
            }

            $saved = $income - $expense;
            $rate = round(($saved / $income) * 100);

            if ($rate >= 20) {
                return "🌟 Saved {$rate}% of income!";
            } elseif ($rate > 0) {
                return "Saved {$rate}%. Goal: 20%.";
            } else {
                return "⚠️ Spent more than earned this month.";
            }
        });
    }

    public function getExpenseAnomaly(int $userId): ?string
    {
        return Cache::remember("user_{$userId}_insight_expense_anomaly", now()->addMinutes(30), function () use ($userId) {
            $avgExpense = Transaction::where('user_id', $userId)
                ->where('type', 'expense')
                ->whereNull('transfer_id')
                ->avg('amount') ?? 0;

            if ($avgExpense == 0) {
                return null;
            }

            $recentLarge = Transaction::where('user_id', $userId)
                ->where('type', 'expense')
                ->whereNull('transfer_id')
                ->whereMonth('transaction_date', Carbon::now()->month)
                ->whereYear('transaction_date', Carbon::now()->year)
                ->where('amount', '>', $avgExpense * 3)
                ->orderBy('transaction_date', 'desc')
                ->first();

            if ($recentLarge) {
                $multiplier = round($recentLarge->amount / $avgExpense, 1);
                $desc = $recentLarge->description ?: 'Unknown';
                $fmt = "Rp " . number_format($recentLarge->amount, 0, ',', '.');
                return "🔎 Anomaly: {$desc} ({$fmt}) is {$multiplier}x above average.";
            }

            return null;
        });
    }

    public function getHighestSpendingDay(int $userId): ?string
    {
        return Cache::remember("user_{$userId}_insight_highest_day", now()->addMinutes(30), function () use ($userId) {
            $topDay = Transaction::where('user_id', $userId)
                ->where('type', 'expense')
                ->whereNull('transfer_id')
                ->selectRaw("TO_CHAR(transaction_date, 'Day') as day, SUM(amount) as total")
                ->groupByRaw("TO_CHAR(transaction_date, 'Day')")
                ->orderByDesc('total')
                ->first();

            if (!$topDay || !$topDay->day) {
                return null;
            }

            return "📅 {$topDay->day}s are your highest spending days.";
        });
    }

    public function getWeekendVsWeekdaySpending(int $userId): ?string
    {
        return Cache::remember("user_{$userId}_insight_weekend_vs_weekday", now()->addMinutes(30), function () use ($userId) {
            $spending = Transaction::where('user_id', $userId)
                ->where('type', 'expense')
                ->whereNull('transfer_id')
                ->selectRaw('
                    SUM(CASE WHEN EXTRACT(DOW FROM transaction_date) IN (0, 6) THEN amount ELSE 0 END) as weekend_total,
                    SUM(CASE WHEN EXTRACT(DOW FROM transaction_date) NOT IN (0, 6) THEN amount ELSE 0 END) as weekday_total
                ')
                ->first();

            if (!$spending || ($spending->weekend_total == 0 && $spending->weekday_total == 0)) {
                return null;
            }

            $total = $spending->weekend_total + $spending->weekday_total;
            if ($total == 0) return null;

            $weekendPct = round(($spending->weekend_total / $total) * 100);
            
            if ($weekendPct > 28) {
                return "🏖️ High weekend spend: {$weekendPct}% of total expenses.";
            } else {
                return "🏢 Most spending occurs on weekdays.";
            }
        });
    }
}
