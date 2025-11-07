<?php

namespace App\Services;

use App\Models\AdminAuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;

class AdminAuditLogger
{
    /**
     * Registra uma ação administrativa no log de auditoria.
     */
    public static function log(string $operation, Model $entity, ?array $details = null): void
    {
        $admin = Auth::user();

        if (!$admin || !$admin->isAdmin()) {
            return;
        }

        AdminAuditLog::create([
            'admin_id' => $admin->id,
            'entity_type' => get_class($entity),
            'entity_id' => $entity->getKey(),
            'operation' => $operation,
            'details' => $details ? json_encode($details, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) : null,
            'acted_at' => now(),
        ]);
    }
}

