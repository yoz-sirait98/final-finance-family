<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Model;

class ActivityLogService
{
    private function sanitizeData(?array $data): ?array
    {
        if (!$data) {
            return null;
        }

        // Remove timestamps and heavy relationship fields to prevent DB bloat
        return collect($data)->except([
            'created_at', 'updated_at', 'deleted_at',
            'user', 'member', 'account', 'category'
        ])->toArray();
    }

    public function log(
        int $userId,
        string $action,
        string $entityType,
        int $entityId,
        ?int $memberId = null,
        ?array $beforeData = null,
        ?array $afterData = null
    ): ActivityLog {
        return ActivityLog::create([
            'user_id' => $userId,
            'member_id' => $memberId,
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'before_data' => $this->sanitizeData($beforeData),
            'after_data' => $this->sanitizeData($afterData),
        ]);
    }

    public function logCreate(
        int $userId,
        string $entityType,
        int $entityId,
        array $data,
        ?int $memberId = null
    ): ActivityLog {
        return $this->log(
            $userId,
            'CREATE',
            $entityType,
            $entityId,
            $memberId,
            null,
            $data
        );
    }

    public function logUpdate(
        int $userId,
        string $entityType,
        int $entityId,
        array $beforeData,
        array $afterData,
        ?int $memberId = null
    ): ActivityLog {
        return $this->log(
            $userId,
            'UPDATE',
            $entityType,
            $entityId,
            $memberId,
            $beforeData,
            $afterData
        );
    }

    public function logDelete(
        int $userId,
        string $entityType,
        int $entityId,
        array $data,
        ?int $memberId = null
    ): ActivityLog {
        return $this->log(
            $userId,
            'DELETE',
            $entityType,
            $entityId,
            $memberId,
            $data,
            null
        );
    }

    public function getUserActivityLogs(int $userId, int $limit = 50)
    {
        return ActivityLog::where('user_id', $userId)
            ->with(['user', 'member'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    public function getEntityActivityLogs(string $entityType, int $entityId)
    {
        return ActivityLog::where('entity_type', $entityType)
            ->where('entity_id', $entityId)
            ->with(['user', 'member'])
            ->orderBy('created_at', 'desc')
            ->get();
    }
}
