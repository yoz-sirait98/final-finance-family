<?php

namespace App\Services;

use App\Models\Account;
use App\Models\NetWorthHistory;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Carbon;

class NetWorthService
{
    private const TTL = 300; // 5 minutes

    private function cacheKey(int $userId, string $type = 'current'): string
    {
        return "networth_{$type}_{$userId}";
    }

    public function clearCache(int $userId): void
    {
        Cache::forget($this->cacheKey($userId, 'current'));
        Cache::forget($this->cacheKey($userId, 'history'));
    }

    public function calculateCurrentNetWorth(int $userId): float
    {
        return Cache::remember($this->cacheKey($userId, 'current'), self::TTL, function () use ($userId) {
            return (float) Account::where('user_id', $userId)->sum('balance');
        });
    }

    public function getHistory(int $userId): array
    {
        // Auto-seed current month snapshot if user has no history yet
        if (!NetWorthHistory::where('user_id', $userId)->exists()) {
            $this->storeMonthlySnapshot();
            Cache::forget($this->cacheKey($userId, 'history'));
        }

        return Cache::remember($this->cacheKey($userId, 'history'), self::TTL, function () use ($userId) {
            return NetWorthHistory::where('user_id', $userId)
                ->orderBy('recorded_at', 'asc')
                ->get()
                ->toArray();
        });
    }

    public function storeMonthlySnapshot(): int
    {
        $count = 0;
        $users = User::all();
        // Record at the first day of the current month to normalize snapshots
        $date = now()->startOfMonth()->toDateString();

        foreach ($users as $user) {
            $totalBalance = $this->calculateCurrentNetWorth($user->id);

            NetWorthHistory::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'recorded_at' => $date,
                ],
                [
                    'total_balance' => $totalBalance,
                ]
            );
            $count++;
        }

        return $count;
    }
}
