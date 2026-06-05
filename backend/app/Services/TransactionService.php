<?php

namespace App\Services;

use App\Models\Transaction;
use App\Models\Account;
use Illuminate\Support\Facades\DB;

class TransactionService
{
    public function __construct(
        private AccountBalanceService $accountBalanceService,
        private ActivityLogService $activityLogService,
        private DashboardService $dashboardService,
        private AccountService $accountService,
        private BudgetService $budgetService
    ) {}

    public function list(int $userId, array $filters = [])
    {
        $query = Transaction::where('user_id', $userId)
            ->select(['id', 'user_id', 'member_id', 'account_id', 'category_id', 'type', 'amount', 'description', 'transaction_date', 'transfer_id', 'created_at'])
            ->with(['member', 'account', 'category']);

        if (!empty($filters['search'])) {
            $query->where('description', 'like', '%' . $filters['search'] . '%');
        }

        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (!empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (!empty($filters['member_id'])) {
            $query->where('member_id', $filters['member_id']);
        }

        if (!empty($filters['account_id'])) {
            $query->where('account_id', $filters['account_id']);
        }

        if (!empty($filters['date_from'])) {
            $query->where('transaction_date', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->where('transaction_date', '<=', $filters['date_to']);
        }

        $sortBy = $filters['sort_by'] ?? 'transaction_date';
        $sortDir = $filters['sort_dir'] ?? 'desc';
        
        $query->orderBy($sortBy, $sortDir);
        // Ensure deterministic ordering for cursor pagination
        if ($sortBy !== 'id') {
            $query->orderBy('id', $sortDir);
        }

        $perPage = $filters['per_page'] ?? 15;

        return $query->cursorPaginate($perPage);
    }

    public function create(array $data): Transaction
    {
        return DB::transaction(function () use ($data) {
            $transaction = Transaction::create($data);
            $this->accountBalanceService->updateBalance($transaction->account_id);
            
            $this->activityLogService->logCreate(
                $data['user_id'],
                'Transaction',
                $transaction->id,
                $transaction->toArray(),
                $data['member_id'] ?? null
            );
            
            $this->dashboardService->clearUserCache($data['user_id']);
            $this->accountService->clearUserCache($data['user_id']);
            $this->budgetService->clearUserCache($data['user_id']);
            return $transaction->load(['member', 'account', 'category']);
        });
    }

    public function update(Transaction $transaction, array $data): Transaction
    {
        return DB::transaction(function () use ($transaction, $data) {
            $beforeData = $transaction->toArray();
            $oldAccountId = $transaction->account_id;
            $transaction->update($data);

            $this->accountBalanceService->updateBalance($transaction->account_id);
            if ($oldAccountId !== $transaction->account_id) {
                $this->accountBalanceService->updateBalance($oldAccountId);
            }

            $this->activityLogService->logUpdate(
                $transaction->user_id,
                'Transaction',
                $transaction->id,
                $beforeData,
                $transaction->toArray(),
                $transaction->member_id
            );

            $this->dashboardService->clearUserCache($transaction->user_id);
            $this->accountService->clearUserCache($transaction->user_id);
            $this->budgetService->clearUserCache($transaction->user_id);
            return $transaction->load(['member', 'account', 'category']);
        });
    }

    public function delete(Transaction $transaction): void
    {
        DB::transaction(function () use ($transaction) {
            $accountId = $transaction->account_id;
            $deletedData = $transaction->toArray();
            $userId = $transaction->user_id;
            $memberId = $transaction->member_id;

            // If part of a transfer, delete the paired transaction too
            if ($transaction->transfer_id) {
                $pair = Transaction::find($transaction->transfer_id);
                if ($pair) {
                    $pairAccountId = $pair->account_id;
                    $pair->delete();
                    $this->accountBalanceService->updateBalance($pairAccountId);
                }
            }

            // Delete any transactions that reference this as their transfer_id
            $linked = Transaction::where('transfer_id', $transaction->id)->first();
            if ($linked) {
                $linkedAccountId = $linked->account_id;
                $linked->delete();
                $this->accountBalanceService->updateBalance($linkedAccountId);
            }

            $transaction->delete();
            $this->accountBalanceService->updateBalance($accountId);

            $this->activityLogService->logDelete(
                $userId,
                'Transaction',
                $transaction->id,
                $deletedData,
                $memberId
            );
            $this->dashboardService->clearUserCache($userId);
            $this->accountService->clearUserCache($userId);
            $this->budgetService->clearUserCache($userId);
        });
    }

    public function createTransfer(array $data): array
    {
        return DB::transaction(function () use ($data) {
            // Create expense from source
            $expense = Transaction::create([
                'user_id' => $data['user_id'],
                'member_id' => $data['member_id'],
                'account_id' => $data['from_account_id'],
                'category_id' => $data['category_id'] ?? null,
                'type' => 'expense',
                'amount' => $data['amount'],
                'description' => $data['description'] ?? 'Transfer out',
                'transaction_date' => $data['transaction_date'],
            ]);

            // Create income to destination
            $income = Transaction::create([
                'user_id' => $data['user_id'],
                'member_id' => $data['member_id'],
                'account_id' => $data['to_account_id'],
                'category_id' => $data['category_id'] ?? null,
                'type' => 'income',
                'amount' => $data['amount'],
                'description' => $data['description'] ?? 'Transfer in',
                'transaction_date' => $data['transaction_date'],
                'transfer_id' => $expense->id,
            ]);

            // Link them
            $expense->update(['transfer_id' => $income->id]);

            $this->accountBalanceService->updateBalance($data['from_account_id']);
            $this->accountBalanceService->updateBalance($data['to_account_id']);

            $this->dashboardService->clearUserCache($data['user_id']);
            $this->accountService->clearUserCache($data['user_id']);
            $this->budgetService->clearUserCache($data['user_id']);

            return [
                $expense->load(['member', 'account', 'category']),
                $income->load(['member', 'account', 'category']),
            ];
        });
    }
}
