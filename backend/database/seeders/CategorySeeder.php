<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\User;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $user = User::first();
        if (!$user) return;

        $categories = [
            // Income
            ['name' => 'Salary', 'type' => 'income', 'icon' => 'bi-cash-stack', 'color' => '#28a745'],
            ['name' => 'Bonus', 'type' => 'income', 'icon' => 'bi-gift', 'color' => '#20c997'],
            ['name' => 'Freelance', 'type' => 'income', 'icon' => 'bi-laptop', 'color' => '#17a2b8'],
            ['name' => 'Investment', 'type' => 'income', 'icon' => 'bi-graph-up-arrow', 'color' => '#0d6efd'],

            // Expense
            ['name' => 'Food', 'type' => 'expense', 'icon' => 'bi-basket', 'color' => '#dc3545'],
            ['name' => 'Transport', 'type' => 'expense', 'icon' => 'bi-car-front', 'color' => '#fd7e14'],
            ['name' => 'Bills', 'type' => 'expense', 'icon' => 'bi-receipt', 'color' => '#ffc107'],
            ['name' => 'Shopping', 'type' => 'expense', 'icon' => 'bi-bag', 'color' => '#e83e8c'],
            ['name' => 'Education', 'type' => 'expense', 'icon' => 'bi-book', 'color' => '#6f42c1'],
            ['name' => 'Healthcare', 'type' => 'expense', 'icon' => 'bi-heart-pulse', 'color' => '#d63384'],
            ['name' => 'Entertainment', 'type' => 'expense', 'icon' => 'bi-controller', 'color' => '#6610f2'],
        ];

        foreach ($categories as $cat) {
            Category::firstOrCreate(
                ['user_id' => $user->id, 'name' => $cat['name']],
                $cat
            );
        }
    }
}
