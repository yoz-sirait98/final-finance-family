<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AccountResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                       => $this->id,
            'name'                     => $this->name,
            'type'                     => $this->type,
            'initial_balance'          => (float) $this->initial_balance,
            'initial_balance_formatted'=> 'Rp ' . number_format($this->initial_balance, 0, ',', '.'),
            'balance'                  => (float) $this->balance,
            'balance_formatted'        => 'Rp ' . number_format($this->balance, 0, ',', '.'),
            'icon'                     => $this->icon,
            'is_active'                => $this->is_active,
            'created_at'               => $this->created_at?->toISOString(),
        ];
    }
}
