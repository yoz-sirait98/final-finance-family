<?php

namespace App\Services;

use App\Models\Goal;
use App\Models\GoalTransaction;
use Illuminate\Support\Facades\DB;

class GoalService
{
    public function __construct(
        private ActivityLogService $activityLogService
    ) {}

    public function list(int $userId, int $page = 1, int $perPage = 15)
    {
        return Goal::where('user_id', $userId)
            ->with(['goalTransactions', 'account'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);
    }

    public function create(int $userId, array $data): Goal
    {
        return DB::transaction(function () use ($userId, $data) {
            $goal = Goal::create([
                ...$data,
                'user_id' => $userId,
                'current_amount' => 0,
                'status' => 'active',
            ]);

            $this->activityLogService->logCreate(
                $userId,
                'Goal',
                $goal->id,
                $goal->toArray()
            );

            return $goal;
        });
    }

    public function update(Goal $goal, array $data): Goal
    {
        return DB::transaction(function () use ($goal, $data) {
            $beforeData = $goal->toArray();
            $goal->update($data);

            $this->activityLogService->logUpdate(
                $goal->user_id,
                'Goal',
                $goal->id,
                $beforeData,
                $goal->toArray()
            );

            return $goal;
        });
    }

    public function delete(Goal $goal): void
    {
        DB::transaction(function () use ($goal) {
            $deletedData = $goal->toArray();
            $userId = $goal->user_id;

            $goal->delete();

            $this->activityLogService->logDelete(
                $userId,
                'Goal',
                $goal->id,
                $deletedData
            );
        });
    }

    public function contribute(Goal $goal, float $amount, ?string $note = null): GoalTransaction
    {
        return DB::transaction(function () use ($goal, $amount, $note) {
            $goalTransaction = GoalTransaction::create([
                'goal_id' => $goal->id,
                'amount' => $amount,
                'note' => $note,
                'transaction_date' => now()->toDateString(),
            ]);

            $goal->increment('current_amount', $amount);

            // Auto-complete if target reached
            if ($goal->current_amount >= $goal->target_amount) {
                $goal->update(['status' => 'completed']);
            }

            return $goalTransaction;
        });
    }
}
