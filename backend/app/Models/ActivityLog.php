<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\MassPrunable;

class ActivityLog extends Model
{
    use MassPrunable;

    protected $table = 'activity_logs';

    public function prunable(): Builder
    {
        // Deletes log entries strictly older than 6 months (Jan to June deleted by Dec, etc)
        return static::where('created_at', '<=', now()->subMonths(6));
    }

    protected $fillable = [
        'user_id',
        'member_id',
        'action',
        'entity_type',
        'entity_id',
        'before_data',
        'after_data',
    ];

    protected $casts = [
        'before_data' => 'array',
        'after_data' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }
}
