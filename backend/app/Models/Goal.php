<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Goal extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'target_amount',
        'current_amount',
        'account_id',
        'deadline',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'target_amount' => 'decimal:2',
            'current_amount' => 'decimal:2',
            'deadline' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function goalTransactions(): HasMany
    {
        return $this->hasMany(GoalTransaction::class);
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function getProgressPercentageAttribute(): float
    {
        if ($this->target_amount <= 0) return 0;
        $current = $this->account_id ? ($this->account->balance ?? 0) : $this->current_amount;
        return min(100, round(($current / $this->target_amount) * 100, 2));
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}
