<?php

namespace App\Services;

use App\Models\ModerationAction;
use App\Models\Report;
use App\Models\User;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ReportService
{
    public function updateStatus(Report $report, string $status, ?string $notes, User $actor, ?string $targetUserStatus = null): Report
    {
        if (! in_array($status, Report::STATUSES, true)) {
            throw ValidationException::withMessages([
                'status' => __('Status de denúncia inválido.'),
            ]);
        }

        return DB::transaction(function () use ($report, $status, $notes, $actor, $targetUserStatus) {
            $report->status = $status;
            $report->handled_by = $actor->id;
            $report->handled_at = now();

            if ($notes !== null) {
                $report->resolution_notes = $notes;
            }

            $report->save();

            if ($targetUserStatus !== null && $report->target_type === 'user') {
                $target = $report->target;

                if ($target === null) {
                    throw new ModelNotFoundException('Usuário alvo não encontrado para atualização de status.');
                }

                if ($target->role === 'admin' && ! $actor->isAdmin()) {
                    throw ValidationException::withMessages([
                        'target_user_status' => __('Apenas administradores podem alterar o status de outro administrador.'),
                    ]);
                }

                if (! in_array($targetUserStatus, ['active', 'suspended', 'banned'], true)) {
                    throw ValidationException::withMessages([
                        'target_user_status' => __('Status de usuário inválido.'),
                    ]);
                }

                if ($target->status !== $targetUserStatus) {
                    $target->status = $targetUserStatus;
                    $target->save();

                    ModerationAction::create([
                        'admin_id' => $actor->id,
                        'target_type' => 'user',
                        'target_id' => $target->id,
                        'action' => 'status_change',
                        'reason' => $notes,
                        'starts_at' => now(),
                        'ends_at' => null,
                    ]);
                }
            }

            return tap($report)->refresh();
        });
    }
}


