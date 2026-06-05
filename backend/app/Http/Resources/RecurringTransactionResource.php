<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RecurringTransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'member' => new MemberResource($this->whenLoaded('member')),
            'account' => new AccountResource($this->whenLoaded('account')),
            'category' => new CategoryResource($this->whenLoaded('category')),
            'type' => $this->type,
            'amount' => (float) $this->amount,
            'amount_formatted' => 'Rp ' . number_format($this->amount, 0, ',', '.'),
            'description' => $this->description,
            'frequency' => $this->frequency,
            'next_due_date' => $this->next_due_date?->format('d-m-Y'),
            'next_due_date_raw' => $this->next_due_date?->toDateString(),
            'end_date' => $this->end_date?->format('d-m-Y'),
            'is_active' => $this->is_active,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
