<?php

namespace App\Services;

use App\Models\DiceRoll;
use App\Models\Campaign;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class DiceRollService
{
    /**
     * Realizar rolagem de dados
     */
    public function rollDice(int $campaignId, int $rollerId, string $formula, ?string $description = null): DiceRoll
    {
        $parsedFormula = $this->parseFormula($formula);
        $result = $this->calculateRoll($parsedFormula);
        
        return DiceRoll::create([
            'campaign_id' => $campaignId,
            'roller_id' => $rollerId,
            'formula' => $formula,
            'result' => $result['total'],
            'detail' => [
                'dice_rolls' => $result['dice_rolls'],
                'modifier' => $result['modifier'],
                'description' => $description,
                'formula_parsed' => $parsedFormula
            ],
            'created_at' => now()
        ]);
    }

    /**
     * Obter rolagens de uma campanha
     */
    public function getCampaignRolls(int $campaignId, array $options = []): LengthAwarePaginator
    {
        $query = DiceRoll::where('campaign_id', $campaignId)
            ->with(['roller', 'campaign'])
            ->orderBy('created_at', 'desc');

        // Filtros
        if (isset($options['roller_id'])) {
            $query->where('roller_id', $options['roller_id']);
        }

        if (isset($options['formula'])) {
            $query->where('formula', 'like', '%' . $options['formula'] . '%');
        }

        if (isset($options['date_from'])) {
            $query->whereDate('created_at', '>=', $options['date_from']);
        }

        if (isset($options['date_to'])) {
            $query->whereDate('created_at', '<=', $options['date_to']);
        }

        $perPage = $options['per_page'] ?? 20;
        return $query->paginate($perPage);
    }

    /**
     * Obter estatísticas de rolagens de uma campanha
     */
    public function getCampaignStats(int $campaignId): array
    {
        $stats = DB::table('dice_rolls')
            ->where('campaign_id', $campaignId)
            ->selectRaw('
                COUNT(*) as total_rolls,
                AVG(result) as average_result,
                MIN(result) as min_result,
                MAX(result) as max_result,
                COUNT(DISTINCT roller_id) as unique_rollers
            ')
            ->first();

        $formulaStats = DB::table('dice_rolls')
            ->where('campaign_id', $campaignId)
            ->selectRaw('formula, COUNT(*) as count, AVG(result) as avg_result')
            ->groupBy('formula')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get();

        $recentRolls = DiceRoll::where('campaign_id', $campaignId)
            ->with('roller')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return [
            'total_rolls' => $stats->total_rolls ?? 0,
            'average_result' => round($stats->average_result ?? 0, 2),
            'min_result' => $stats->min_result ?? 0,
            'max_result' => $stats->max_result ?? 0,
            'unique_rollers' => $stats->unique_rollers ?? 0,
            'popular_formulas' => $formulaStats,
            'recent_rolls' => $recentRolls
        ];
    }

    /**
     * Parsear fórmula de dados (ex: "2d6+3" -> ['dice' => 2, 'sides' => 6, 'modifier' => 3])
     */
    private function parseFormula(string $formula): array
    {
        // Remover espaços e converter para minúsculo
        $formula = strtolower(trim($formula));
        
        // Regex para capturar: número de dados, lados do dado, modificador
        if (!preg_match('/^(\d+)d(\d+)([+\-]\d+)?$/', $formula, $matches)) {
            throw new \InvalidArgumentException('Fórmula inválida. Use formato como: 1d20, 2d6+3, 3d4-1');
        }

        $dice = (int) $matches[1];
        $sides = (int) $matches[2];
        $modifier = isset($matches[3]) ? (int) $matches[3] : 0;

        // Validações
        if ($dice < 1 || $dice > 100) {
            throw new \InvalidArgumentException('Número de dados deve estar entre 1 e 100');
        }

        if ($sides < 2 || $sides > 1000) {
            throw new \InvalidArgumentException('Número de lados deve estar entre 2 e 1000');
        }

        if (abs($modifier) > 1000) {
            throw new \InvalidArgumentException('Modificador deve estar entre -1000 e 1000');
        }

        return [
            'dice' => $dice,
            'sides' => $sides,
            'modifier' => $modifier
        ];
    }

    /**
     * Calcular resultado da rolagem
     */
    private function calculateRoll(array $parsedFormula): array
    {
        $diceRolls = [];
        $total = 0;

        // Rolar cada dado
        for ($i = 0; $i < $parsedFormula['dice']; $i++) {
            $roll = rand(1, $parsedFormula['sides']);
            $diceRolls[] = $roll;
            $total += $roll;
        }

        // Adicionar modificador
        $total += $parsedFormula['modifier'];

        return [
            'dice_rolls' => $diceRolls,
            'modifier' => $parsedFormula['modifier'],
            'total' => $total
        ];
    }

    /**
     * Validar fórmula de dados
     */
    public function validateFormula(string $formula): bool
    {
        try {
            $this->parseFormula($formula);
            return true;
        } catch (\InvalidArgumentException $e) {
            return false;
        }
    }

    /**
     * Obter rolagens recentes de um usuário
     */
    public function getUserRecentRolls(int $userId, int $limit = 10): Collection
    {
        return DiceRoll::where('roller_id', $userId)
            ->with(['campaign', 'roller'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Obter estatísticas de um usuário
     */
    public function getUserStats(int $userId): array
    {
        $stats = DB::table('dice_rolls')
            ->where('roller_id', $userId)
            ->selectRaw('
                COUNT(*) as total_rolls,
                AVG(result) as average_result,
                MIN(result) as min_result,
                MAX(result) as max_result
            ')
            ->first();

        return [
            'total_rolls' => $stats->total_rolls ?? 0,
            'average_result' => round($stats->average_result ?? 0, 2),
            'min_result' => $stats->min_result ?? 0,
            'max_result' => $stats->max_result ?? 0
        ];
    }
}
