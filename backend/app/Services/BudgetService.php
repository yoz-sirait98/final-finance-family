<?php

namespace App\Services;

use App\Models\Budget;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class BudgetService
{
    private const TTL = 300; // 5 minutes

    private function versionKey(int $userId): string
    {
        return 'budget_v_' . $userId;
    }

    private function cacheKey(int $userId, ?int $month = null, ?int $year = null, int $page = 1, int $perPage = 15): string
    {
        $version = Cache::get($this->versionKey($userId), 1);
        return 'budget_' . $userId . '_v' . $version . '_' . ($month ?? 0) . '_' . ($year ?? 0) . '_' . $page . '_' . $perPage;
    }

    public function clearUserCache(int $userId): void
    {
        // Bump the version — all existing cache keys immediately become stale
        // This avoids brute-force enumeration of thousands of keys (which caused 502s)
        $versionKey = $this->versionKey($userId);
        $current = Cache::get($versionKey, 1);
        Cache::put($versionKey, $current + 1, now()->addDays(7));
    }

    public function __construct(
        private ActivityLogService $activityLogService
    ) {}

    public function list(int $userId, ?int $month = null, ?int $year = null, int $page = 1, int $perPage = 15)
    {
        $month = $month ?? now()->month;
        $year = $year ?? now()->year;

        return Cache::remember($this->cacheKey($userId, $month, $year, $page, $perPage), self::TTL, function () use ($userId, $month, $year, $page, $perPage) {
            $budgets = Budget::where('user_id', $userId)
                ->where('month', $month)
                ->where('year', $year)
                ->with('category')
                ->paginate($perPage, ['*'], 'page', $page);

            if ($budgets->isEmpty()) {
                return collect([]);
            }

            // Single query to get spending for all budget categories at once
            $categoryIds = $budgets->pluck('category_id')->filter()->unique()->values();

            $spentMap = Transaction::where('user_id', $userId)
                ->where('type', 'expense')
                ->whereNull('transfer_id')
                ->whereIn('category_id', $categoryIds)
                ->whereMonth('transaction_date', $month)
                ->whereYear('transaction_date', $year)
                ->selectRaw('category_id, SUM(amount) as total')
                ->groupBy('category_id')
                ->pluck('total', 'category_id');

            return $budgets->map(function ($b) use ($spentMap) {
                $spent = (float) ($spentMap[$b->category_id] ?? 0);
                $b->spent = $spent;
                $b->remaining = max(0, $b->amount - $spent);
                $b->percentage = $b->amount > 0 ? round(($spent / $b->amount) * 100, 2) : 0;
                $b->is_over_threshold = $b->percentage >= 80;
                return $b;
            });
        });
    }

    public function getAlerts(int $userId, ?int $month = null, ?int $year = null): array
    {
        return $this->list($userId, $month, $year)
            ->filter(fn ($budget) => $budget->is_over_threshold)
            ->values()
            ->toArray();
    }

    public function createOrUpdate(int $userId, array $data): Budget
    {
        return DB::transaction(function () use ($userId, $data) {
            $budget = Budget::where('user_id', $userId)
                ->where('category_id', $data['category_id'])
                ->where('month', $data['month'])
                ->where('year', $data['year'])
                ->first();

            if ($budget) {
                $beforeData = $budget->toArray();
                $budget->update(['amount' => $data['amount']]);

                $this->activityLogService->logUpdate(
                    $userId,
                    'Budget',
                    $budget->id,
                    $beforeData,
                    $budget->toArray()
                );
            } else {
                $budget = Budget::create([
                    'user_id' => $userId,
                    'category_id' => $data['category_id'],
                    'amount' => $data['amount'],
                    'month' => $data['month'],
                    'year' => $data['year'],
                ]);

                $this->activityLogService->logCreate(
                    $userId,
                    'Budget',
                    $budget->id,
                    $budget->toArray()
                );
            }

            $this->clearUserCache($userId);
            return $budget->load('category');
        });
    }

    public function update(Budget $budget, array $data): Budget
    {
        return DB::transaction(function () use ($budget, $data) {
            $beforeData = $budget->toArray();
            $budget->update($data);

            $this->activityLogService->logUpdate(
                $budget->user_id,
                'Budget',
                $budget->id,
                $beforeData,
                $budget->toArray()
            );

            $this->clearUserCache($budget->user_id);
            return $budget->load('category');
        });
    }

    public function delete(Budget $budget): void
    {
        DB::transaction(function () use ($budget) {
            $deletedData = $budget->toArray();
            $userId = $budget->user_id;

            $budget->delete();

            $this->activityLogService->logDelete(
                $userId,
                'Budget',
                $budget->id,
                $deletedData
            );

            $this->clearUserCache($userId);
        });
    }
}

