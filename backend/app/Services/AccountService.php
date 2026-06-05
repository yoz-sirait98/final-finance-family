<?php

namespace App\Services;

use App\Models\Account;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class AccountService
{
    private const TTL = 300; // 5 minutes

    private function cacheKey(int $userId): string
    {
        return 'account_list_' . $userId;
    }

    public function clearUserCache(int $userId): void
    {
        Cache::forget($this->cacheKey($userId));
    }

    public function __construct(
        private AccountBalanceService $accountBalanceService,
        private ActivityLogService $activityLogService,
        private DashboardService $dashboardService
    ) {}

    public function list(int $userId)
    {
        return Cache::remember($this->cacheKey($userId), self::TTL, function () use ($userId) {
            return Account::where('user_id', $userId)->orderBy('name')->get();
        });
    }

    public function create(int $userId, array $data): Account
    {
        return DB::transaction(function () use ($userId, $data) {
            $initialBalance = $data['initial_balance'] ?? 0;

            $account = Account::create([
                'user_id' => $userId,
                'name' => $data['name'],
                'type' => $data['type'],
                'icon' => $data['icon'] ?? null,
                'initial_balance' => $initialBalance,
                'balance' => $initialBalance,
            ]);

            $this->activityLogService->logCreate(
                $userId,
                'Account',
                $account->id,
                $account->toArray()
            );

            $this->clearUserCache($userId);
            $this->dashboardService->clearUserCache($userId);
            return $account;
        });
    }

    public function update(Account $account, array $data): Account
    {
        return DB::transaction(function () use ($account, $data) {
            $beforeData = $account->toArray();
            $account->update($data);

            if (isset($data['initial_balance'])) {
                $this->accountBalanceService->updateBalance($account->id);
                $account->refresh();
            }

            $this->activityLogService->logUpdate(
                $account->user_id,
                'Account',
                $account->id,
                $beforeData,
                $account->toArray()
            );

            $this->clearUserCache($account->user_id);
            $this->dashboardService->clearUserCache($account->user_id);
            return $account;
        });
    }

    public function delete(Account $account): void
    {
        DB::transaction(function () use ($account) {
            $deletedData = $account->toArray();
            $userId = $account->user_id;

            $account->delete();

            $this->activityLogService->logDelete(
                $userId,
                'Account',
                $account->id,
                $deletedData
            );

            $this->clearUserCache($userId);
            $this->dashboardService->clearUserCache($userId);
        });
    }
}
