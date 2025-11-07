<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Auth;

class PusherTestController extends Controller
{
    /**
     * Testar evento de broadcasting público
     */
    public function testPublic(Request $request): JsonResponse
    {
        try {
            $message = $request->get('message', 'Teste de evento público');
            
            // Disparar evento de teste em canal público
            broadcast(new \App\Events\PusherTestEvent($message, 'public'))
                ->toOthers();

            return response()->json([
                'success' => true,
                'message' => 'Evento de teste público enviado',
                'data' => ['message' => $message]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao enviar evento de teste',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Testar evento de broadcasting privado
     */
    public function testPrivate(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Usuário não autenticado'
            ], 401);
        }

        try {
            $message = $request->get('message', 'Teste de evento privado');
            
            // Disparar evento de teste em canal privado do usuário
            broadcast(new \App\Events\PusherTestEvent($message, 'private', $user))
                ->toOthers();

            return response()->json([
                'success' => true,
                'message' => 'Evento de teste privado enviado',
                'data' => ['message' => $message, 'user_id' => $user->id]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao enviar evento de teste',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Testar evento em canal de conversa
     */
    public function testConversation(Request $request, $conversationId): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Usuário não autenticado'
            ], 401);
        }

        // Verificar se usuário é participante da conversa
        $conversation = \App\Models\Conversation::findOrFail($conversationId);
        if (!$conversation->participants()->where('user_id', $user->id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Acesso negado a esta conversa'
            ], 403);
        }

        try {
            $message = $request->get('message', 'Teste de evento de conversa');
            
            // Disparar evento de teste no canal da conversa
            broadcast(new \App\Events\PusherTestEvent($message, 'conversation', $user, $conversationId))
                ->toOthers();

            return response()->json([
                'success' => true,
                'message' => 'Evento de teste de conversa enviado',
                'data' => [
                    'message' => $message,
                    'conversation_id' => $conversationId,
                    'user_id' => $user->id
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao enviar evento de teste',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}









