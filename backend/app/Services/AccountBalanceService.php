<?php

namespace App\Services;

use App\Models\Account;
use App\Models\Transaction;

class AccountBalanceService
{
    public function updateBalance(int $accountId): void
    {
        // lockForUpdate() requires an active outer DB::transaction (from the caller).
        // Do NOT wrap in a nested DB::transaction here — MySQL treats it as a savepoint
        // which can silently swallow errors and prevent the lock from working correctly.
        $account = Account::lockForUpdate()->findOrFail($accountId);

        $income = Transaction::where('account_id', $accountId)
            ->where('type', 'income')
            ->sum('amount');

        $expense = Transaction::where('account_id', $accountId)
            ->where('type', 'expense')
            ->sum('amount');

        $newBalance = $account->initial_balance + $income - $expense;

        if ($newBalance < 0) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'account' => "Action denied: The balance of account '{$account->name}' would drop below zero."
            ]);
        }

        $account->update([
            'balance' => $newBalance,
        ]);
    }

    public function recalculateAll(int $userId): void
    {
        $accounts = Account::where('user_id', $userId)->get();
        foreach ($accounts as $account) {
            $this->updateBalance($account->id);
        }
    }
}
