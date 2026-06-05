<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BudgetResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'category'         => new CategoryResource($this->whenLoaded('category')),
            'amount'           => (float) $this->amount,
            'amount_formatted' => 'Rp ' . number_format($this->amount, 0, ',', '.'),
            'spent'            => (float) ($this->spent ?? 0),
            'remaining'        => (float) ($this->remaining ?? $this->amount),
            'percentage'       => (float) ($this->percentage ?? 0),
            'is_over_threshold'=> (bool)  ($this->is_over_threshold ?? false),
            'month'            => $this->month,
            'year'             => $this->year,
            'created_at'       => $this->created_at?->toISOString(),
        ];
    }
}
