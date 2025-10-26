<?php

namespace App\Http\Controllers;

use App\Models\DiceRoll;
use App\Models\Campaign;
use App\Services\DiceRollService;
use App\Http\Resources\DiceRollResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class DiceRollController extends Controller
{
    protected DiceRollService $diceRollService;

    public function __construct(DiceRollService $diceRollService)
    {
        $this->diceRollService = $diceRollService;
    }

    /**
     * Listar rolagens de dados de uma campanha
     */
    public function index(Request $request, Campaign $campaign): JsonResponse
    {
        $user = Auth::user();
        
        // Verificar se o usuário é membro da campanha
        if (!$campaign->members()->where('user_id', $user->id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Acesso negado a esta campanha'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'per_page' => 'integer|min:1|max:100',
            'roller_id' => 'integer|exists:users,id',
            'formula' => 'string|max:50',
            'date_from' => 'date',
            'date_to' => 'date|after_or_equal:date_from'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Parâmetros inválidos',
                'errors' => $validator->errors()
            ], 400);
        }

        try {
            $perPage = $request->get('per_page', 20);
            $rollerId = $request->get('roller_id');
            $formula = $request->get('formula');
            $dateFrom = $request->get('date_from');
            $dateTo = $request->get('date_to');

            $rolls = $this->diceRollService->getCampaignRolls($campaign->id, [
                'per_page' => $perPage,
                'roller_id' => $rollerId,
                'formula' => $formula,
                'date_from' => $dateFrom,
                'date_to' => $dateTo
            ]);

            return response()->json([
                'success' => true,
                'data' => DiceRollResource::collection($rolls),
                'message' => 'Rolagens recuperadas com sucesso'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao buscar rolagens',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Realizar rolagem de dados
     */
    public function store(Request $request, Campaign $campaign): JsonResponse
    {
        $user = Auth::user();
        
        // Verificar se o usuário é membro da campanha
        if (!$campaign->members()->where('user_id', $user->id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Acesso negado a esta campanha'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'formula' => 'required|string|max:50|regex:/^[0-9]+[dD][0-9]+([+\-][0-9]+)?$/',
            'description' => 'nullable|string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Fórmula inválida. Use formato como: 1d20, 2d6+3, 3d4-1',
                'errors' => $validator->errors()
            ], 400);
        }

        try {
            $formula = $request->get('formula');
            $description = $request->get('description');

            $result = $this->diceRollService->rollDice($campaign->id, $user->id, $formula, $description);

            return response()->json([
                'success' => true,
                'data' => new DiceRollResource($result),
                'message' => 'Rolagem realizada com sucesso'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao realizar rolagem',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obter estatísticas de rolagens
     */
    public function stats(Campaign $campaign): JsonResponse
    {
        $user = Auth::user();
        
        // Verificar se o usuário é membro da campanha
        if (!$campaign->members()->where('user_id', $user->id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Acesso negado a esta campanha'
            ], 403);
        }

        try {
            $stats = $this->diceRollService->getCampaignStats($campaign->id);

            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'Estatísticas recuperadas com sucesso'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao buscar estatísticas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Deletar rolagem (apenas o autor ou GM)
     */
    public function destroy(DiceRoll $diceRoll): JsonResponse
    {
        $user = Auth::user();
        
        // Verificar se o usuário é o autor da rolagem ou GM da campanha
        $campaign = $diceRoll->campaign;
        $isGM = $campaign->members()->where('user_id', $user->id)->where('role', 'gm')->exists();
        
        if ($diceRoll->roller_id !== $user->id && !$isGM) {
            return response()->json([
                'success' => false,
                'message' => 'Sem permissão para deletar esta rolagem'
            ], 403);
        }

        try {
            $diceRoll->delete();

            return response()->json([
                'success' => true,
                'message' => 'Rolagem deletada com sucesso'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao deletar rolagem',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
