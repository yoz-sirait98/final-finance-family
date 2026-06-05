<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
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
            'transaction_date' => $this->transaction_date?->format('d-m-Y'),
            'transaction_date_raw' => $this->transaction_date?->toDateString(),
            'transfer_id' => $this->transfer_id,
            'is_transfer' => $this->type === 'transfer' || $this->transfer_id !== null,
            'attachments' => TransactionAttachmentResource::collection($this->whenLoaded('attachments')),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
