<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GoalResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $current = $this->account_id ? ($this->account->balance ?? 0) : $this->current_amount;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'target_amount' => (float) $this->target_amount,
            'target_amount_formatted' => 'Rp ' . number_format($this->target_amount, 0, ',', '.'),
            'current_amount' => (float) $current,
            'current_amount_formatted' => 'Rp ' . number_format($current, 0, ',', '.'),
            'progress_percentage' => $this->progress_percentage,
            'deadline' => $this->deadline?->format('d-m-Y'),
            'deadline_raw' => $this->deadline?->toDateString(),
            'status' => $this->status,
            'account_id' => $this->account_id,
            'account_name' => $this->whenLoaded('account', fn () => $this->account?->name),
            'transactions' => GoalTransactionResource::collection($this->whenLoaded('goalTransactions')),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
