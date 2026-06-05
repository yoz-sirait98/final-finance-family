<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Composite index for budget alert queries
        Schema::table('budgets', function (Blueprint $table) {
            $table->index(['user_id', 'month', 'year'], 'budgets_user_month_year');
        });

        // Composite index for transaction dashboard/report grouping queries
        Schema::table('transactions', function (Blueprint $table) {
            $table->index(['user_id', 'type', 'transfer_id', 'transaction_date'], 'transactions_dashboard_lookup');
            $table->index(['user_id', 'category_id', 'type', 'transaction_date'], 'transactions_category_lookup');
        });
    }

    public function down(): void
    {
        Schema::table('budgets', function (Blueprint $table) {
            $table->dropIndex('budgets_user_month_year');
        });

        Schema::table('transactions', function (Blueprint $table) {
            $table->dropIndex('transactions_dashboard_lookup');
            $table->dropIndex('transactions_category_lookup');
        });
    }
};
