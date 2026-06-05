<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Process recurring transactions daily at midnight Jakarta time
Schedule::command('transactions:process-recurring')->daily();

// Record net worth snapshot on the first day of every month at midnight
Schedule::call(fn () => app(\App\Services\NetWorthService::class)->storeMonthlySnapshot())->monthly();

// Clean up stale activity logs automatically every night
Schedule::command('model:prune', [
    '--model' => [\App\Models\ActivityLog::class],
])->daily();
