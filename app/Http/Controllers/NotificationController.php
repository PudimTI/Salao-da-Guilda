<?php

namespace App\Http\Controllers;

use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    protected NotificationService $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Listar notificações do usuário
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        $perPage = $request->get('per_page', 15);
        $type = $request->get('type');
        $unreadOnly = $request->get('unread_only', false);

        $notifications = $this->notificationService->getUserNotifications($user->id, [
            'per_page' => $perPage,
            'type' => $type,
            'unread_only' => $unreadOnly
        ]);

        return response()->json([
            'success' => true,
            'data' => $notifications,
            'message' => 'Notificações recuperadas com sucesso'
        ]);
    }

    /**
     * Marcar notificações como lidas
     */
    public function markAsRead(Request $request): JsonResponse
    {
        $user = Auth::user();
        $notificationIds = $request->get('notification_ids', []);

        $count = $this->notificationService->markNotificationsAsRead($user->id, $notificationIds);

        return response()->json([
            'success' => true,
            'message' => "{$count} notificações marcadas como lidas",
            'count' => $count
        ]);
    }

    /**
     * Obter contagem de notificações não lidas
     */
    public function getUnreadCount(): JsonResponse
    {
        $user = Auth::user();
        $count = $this->notificationService->getUnreadCount($user->id);

        return response()->json([
            'success' => true,
            'data' => ['unread_count' => $count],
            'message' => 'Contagem de notificações não lidas recuperada'
        ]);
    }
}
