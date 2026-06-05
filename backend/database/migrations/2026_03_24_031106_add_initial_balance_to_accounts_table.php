<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('accounts', function (Blueprint $table) {
            $table->decimal('initial_balance', 16, 2)->default(0)->after('type');
        });

        // Migrate existing data: treat current balance as initial_balance
        // since there may be no transactions yet (or balances were set manually)
        DB::statement('UPDATE accounts SET initial_balance = balance');
    }

    public function down(): void
    {
        Schema::table('accounts', function (Blueprint $table) {
            $table->dropColumn('initial_balance');
        });
    }
};
