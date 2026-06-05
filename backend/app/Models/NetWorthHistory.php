<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NetWorthHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'total_balance',
        'recorded_at',
    ];

    protected function casts(): array
    {
        return [
            'total_balance' => 'decimal:2',
            'recorded_at' => 'date',
        ];
    }
}
