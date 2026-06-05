<?php

namespace App\Services;

use App\Models\RecurringTransaction;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Carbon;

class RecurringTransactionService
{
    private const TTL = 300; // 5 minutes

    private function cacheKey(int $userId, array $filters = []): string
    {
        $parts = [
            'recurring',
            $userId,
            $filters['page'] ?? 1,
            $filters['per_page'] ?? 15,
            $filters['member_id'] ?? 0,
            $filters['account_id'] ?? 0,
            $filters['category_id'] ?? 0,
            $filters['type'] ?? 'all',
            $filters['is_active'] ?? 'all',
        ];

        return implode('_', $parts);
    }

    private function clearCache(int $userId): void
    {
        // It is a pragmatic invalidation: leverage pattern-based keys.
        // A more advanced system may use a dedicated cache tag driver.
        foreach (range(1, 100) as $page) {
            Cache::forget($this->cacheKey($userId, ['page' => $page]));
        }
    }

    public function __construct(
        private AccountBalanceService $accountBalanceService,
        private ActivityLogService $activityLogService
    ) {}

    public function processDue(): int
    {
        $count = 0;
        $dueRecurrings = RecurringTransaction::active()
            ->due()
            ->get();

        foreach ($dueRecurrings as $recurring) {
            DB::transaction(function () use ($recurring, &$count) {
                Transaction::create([
                    'user_id' => $recurring->user_id,
                    'member_id' => $recurring->member_id,
                    'account_id' => $recurring->account_id,
                    'category_id' => $recurring->category_id,
                    'type' => $recurring->type,
                    'amount' => $recurring->amount,
                    'description' => $recurring->description . ' (recurring)',
                    'transaction_date' => $recurring->next_due_date,
                ]);

                $this->accountBalanceService->updateBalance($recurring->account_id);

                // Calculate next due date
                $nextDate = match ($recurring->frequency) {
                    'weekly' => Carbon::parse($recurring->next_due_date)->addWeek(),
                    'monthly' => Carbon::parse($recurring->next_due_date)->addMonth(),
                    'yearly' => Carbon::parse($recurring->next_due_date)->addYear(),
                };

                // Deactivate if past end date
                if ($recurring->end_date && $nextDate->gt($recurring->end_date)) {
                    $recurring->update(['is_active' => false]);
                } else {
                    $recurring->update(['next_due_date' => $nextDate]);
                }

                $this->clearCache($recurring->user_id);
                $count++;
            });
        }

        return $count;
    }

    public function list(int $userId, array $filters = [])
    {
        $page = (int) ($filters['page'] ?? 1);
        $perPage = (int) ($filters['per_page'] ?? 15);

        return Cache::remember($this->cacheKey($userId, $filters), self::TTL, function () use ($userId, $filters, $page, $perPage) {
            $query = RecurringTransaction::where('user_id', $userId)
                ->with(['member', 'account', 'category']);

            if (!empty($filters['search'])) {
                $query->where('description', 'like', '%' . $filters['search'] . '%');
            }
            if (!empty($filters['type'])) {
                $query->where('type', $filters['type']);
            }
            if (!empty($filters['member_id'])) {
                $query->where('member_id', $filters['member_id']);
            }
            if (!empty($filters['account_id'])) {
                $query->where('account_id', $filters['account_id']);
            }
            if (!empty($filters['category_id'])) {
                $query->where('category_id', $filters['category_id']);
            }
            if (isset($filters['is_active']) && $filters['is_active'] !== 'all') {
                $query->where('is_active', boolval($filters['is_active']));
            }

            return $query->orderBy('next_due_date', 'asc')->paginate($perPage, ['*'], 'page', $page);
        });
    }

    public function create(array $data, int $userId): RecurringTransaction
    {
        $recurring = RecurringTransaction::create([
            ...$data,
            'user_id' => $userId,
        ]);

        $this->activityLogService->logCreate(
            $userId,
            'RecurringTransaction',
            $recurring->id,
            $recurring->toArray(),
            $data['member_id'] ?? null
        );

        $this->clearCache($userId);

        return $recurring;
    }

    public function update(RecurringTransaction $recurring, array $data): RecurringTransaction
    {
        $beforeData = $recurring->toArray();

        $recurring->update($data);

        $this->activityLogService->logUpdate(
            $recurring->user_id,
            'RecurringTransaction',
            $recurring->id,
            $beforeData,
            $recurring->fresh()->toArray(),
            $recurring->member_id
        );

        $this->clearCache($recurring->user_id);

        return $recurring;
    }

    public function delete(RecurringTransaction $recurring): void
    {
        $beforeData = $recurring->toArray();

        $recurring->delete();

        $this->activityLogService->logDelete(
            $recurring->user_id,
            'RecurringTransaction',
            $recurring->id,
            $beforeData,
            $recurring->member_id
        );

        $this->clearCache($recurring->user_id);
    }
}
