<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Member;
use App\Models\Account;
use App\Models\Transaction;
use App\Models\Goal;
use App\Models\Budget;
use App\Models\Category;
use App\Models\RecurringTransaction;
use Illuminate\Support\Facades\Hash;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        // Create family account
        $user = User::firstOrCreate(
            ['email' => 'family@example.com'],
            [
                'name' => 'Keluarga Budiman',
                'password' => Hash::make('password'),
            ]
        );

        // Create members
        $father = Member::firstOrCreate(
            ['user_id' => $user->id, 'name' => 'Budi'],
            ['role' => 'father']
        );
        $mother = Member::firstOrCreate(
            ['user_id' => $user->id, 'name' => 'Sari'],
            ['role' => 'mother']
        );
        $child = Member::firstOrCreate(
            ['user_id' => $user->id, 'name' => 'Andi'],
            ['role' => 'child']
        );

        // Create accounts
        $bca = Account::firstOrCreate(
            ['user_id' => $user->id, 'name' => 'BCA'],
            ['type' => 'bank', 'balance' => 15000000, 'icon' => 'bi-bank']
        );
        $bri = Account::firstOrCreate(
            ['user_id' => $user->id, 'name' => 'BRI'],
            ['type' => 'bank', 'balance' => 8000000, 'icon' => 'bi-bank']
        );
        $cash = Account::firstOrCreate(
            ['user_id' => $user->id, 'name' => 'Cash'],
            ['type' => 'cash', 'balance' => 2000000, 'icon' => 'bi-wallet2']
        );
        $gopay = Account::firstOrCreate(
            ['user_id' => $user->id, 'name' => 'GoPay'],
            ['type' => 'ewallet', 'balance' => 500000, 'icon' => 'bi-phone']
        );
        $ovo = Account::firstOrCreate(
            ['user_id' => $user->id, 'name' => 'OVO'],
            ['type' => 'ewallet', 'balance' => 750000, 'icon' => 'bi-phone']
        );

        // Run category seeder first
        $this->call(CategorySeeder::class);

        $categories = Category::where('user_id', $user->id)->get()->keyBy('name');

        // Sample transactions for current month
        $transactions = [
            ['member_id' => $father->id, 'account_id' => $bca->id, 'category_id' => $categories['Salary']->id, 'type' => 'income', 'amount' => 12000000, 'description' => 'Gaji bulanan', 'transaction_date' => now()->startOfMonth()->addDays(0)],
            ['member_id' => $mother->id, 'account_id' => $bri->id, 'category_id' => $categories['Freelance']->id, 'type' => 'income', 'amount' => 3500000, 'description' => 'Proyek desain', 'transaction_date' => now()->startOfMonth()->addDays(2)],
            ['member_id' => $father->id, 'account_id' => $bca->id, 'category_id' => $categories['Food']->id, 'type' => 'expense', 'amount' => 2500000, 'description' => 'Belanja bulanan', 'transaction_date' => now()->startOfMonth()->addDays(3)],
            ['member_id' => $mother->id, 'account_id' => $cash->id, 'category_id' => $categories['Transport']->id, 'type' => 'expense', 'amount' => 800000, 'description' => 'Bensin dan parkir', 'transaction_date' => now()->startOfMonth()->addDays(5)],
            ['member_id' => $child->id, 'account_id' => $gopay->id, 'category_id' => $categories['Education']->id, 'type' => 'expense', 'amount' => 500000, 'description' => 'Les bahasa Inggris', 'transaction_date' => now()->startOfMonth()->addDays(7)],
            ['member_id' => $father->id, 'account_id' => $bca->id, 'category_id' => $categories['Bills']->id, 'type' => 'expense', 'amount' => 1200000, 'description' => 'Listrik dan air', 'transaction_date' => now()->startOfMonth()->addDays(10)],
            ['member_id' => $mother->id, 'account_id' => $ovo->id, 'category_id' => $categories['Shopping']->id, 'type' => 'expense', 'amount' => 750000, 'description' => 'Baju anak', 'transaction_date' => now()->startOfMonth()->addDays(12)],
            ['member_id' => $father->id, 'account_id' => $bca->id, 'category_id' => $categories['Entertainment']->id, 'type' => 'expense', 'amount' => 300000, 'description' => 'Nonton bioskop keluarga', 'transaction_date' => now()->startOfMonth()->addDays(14)],
        ];

        foreach ($transactions as $tx) {
            Transaction::firstOrCreate(
                [
                    'user_id' => $user->id,
                    'description' => $tx['description'],
                    'transaction_date' => $tx['transaction_date'],
                ],
                $tx + ['user_id' => $user->id]
            );
        }

        // Sample budgets
        $budgetData = [
            ['category' => 'Food', 'amount' => 3000000],
            ['category' => 'Transport', 'amount' => 1000000],
            ['category' => 'Bills', 'amount' => 1500000],
            ['category' => 'Shopping', 'amount' => 1000000],
            ['category' => 'Education', 'amount' => 1000000],
        ];

        foreach ($budgetData as $b) {
            if (isset($categories[$b['category']])) {
                Budget::firstOrCreate([
                    'user_id' => $user->id,
                    'category_id' => $categories[$b['category']]->id,
                    'month' => now()->month,
                    'year' => now()->year,
                ], ['amount' => $b['amount']]);
            }
        }

        // Sample goals
        Goal::firstOrCreate(
            ['user_id' => $user->id, 'name' => 'Dana Darurat'],
            ['target_amount' => 50000000, 'current_amount' => 12000000, 'deadline' => now()->addYear(), 'status' => 'active']
        );
        Goal::firstOrCreate(
            ['user_id' => $user->id, 'name' => 'Liburan Bali'],
            ['target_amount' => 10000000, 'current_amount' => 3500000, 'deadline' => now()->addMonths(6), 'status' => 'active']
        );

        // Sample recurring
        if (isset($categories['Bills'])) {
            RecurringTransaction::firstOrCreate(
                ['user_id' => $user->id, 'description' => 'Internet bulanan'],
                [
                    'member_id' => $father->id,
                    'account_id' => $bca->id,
                    'category_id' => $categories['Bills']->id,
                    'type' => 'expense',
                    'amount' => 500000,
                    'frequency' => 'monthly',
                    'next_due_date' => now()->addMonth()->startOfMonth(),
                ]
            );
        }
    }
}
