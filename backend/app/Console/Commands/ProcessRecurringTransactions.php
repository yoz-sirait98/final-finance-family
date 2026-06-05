<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\RecurringTransactionService;

class ProcessRecurringTransactions extends Command
{
    protected $signature = 'transactions:process-recurring';
    protected $description = 'Process all due recurring transactions';

    public function handle(RecurringTransactionService $service): int
    {
        $count = $service->processDue();
        $this->info("Processed {$count} recurring transaction(s).");

        return Command::SUCCESS;
    }
}
