<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement('CREATE INDEX IF NOT EXISTS transactions_user_account ON transactions (user_id, account_id)');
        DB::statement('CREATE INDEX IF NOT EXISTS transactions_user_type_date ON transactions (user_id, type, transaction_date)');
        DB::statement('CREATE INDEX IF NOT EXISTS transactions_member_date ON transactions (member_id, transaction_date)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS transactions_user_account');
        DB::statement('DROP INDEX IF EXISTS transactions_user_type_date');
        DB::statement('DROP INDEX IF EXISTS transactions_member_date');
    }
};
