<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use App\Models\MindmapNode;
use App\Models\MindmapEdge;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\View\View;

class MindmapController extends Controller
{
    /**
     * Listar todos os mapas mentais do sistema
     */
    public function index(): View
    {
        $campaigns = Campaign::with(['owner', 'mindmapNodes'])
            ->whereHas('mindmapNodes')
            ->paginate(20);

        return view('admin.mindmap.index', compact('campaigns'));
    }

    /**
     * Visualizar mapa mental específico
     */
    public function show(Campaign $campaign): View
    {
        $campaign->load([
            'owner',
            'members',
            'mindmapNodes.files',
            'mindmapEdges.sourceNode',
            'mindmapEdges.targetNode'
        ]);

        return view('admin.mindmap.show', compact('campaign'));
    }

    /**
     * API para obter dados do mapa mental
     */
    public function getMindmapData(Campaign $campaign): JsonResponse
    {
        $nodes = $campaign->mindmapNodes()
            ->with(['files', 'outgoingEdges.targetNode', 'incomingEdges.sourceNode'])
            ->get();

        $edges = $campaign->mindmapEdges()
            ->with(['sourceNode', 'targetNode'])
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'campaign' => [
                    'id' => $campaign->id,
                    'name' => $campaign->name,
                    'owner' => $campaign->owner->name,
                    'members_count' => $campaign->members->count()
                ],
                'nodes' => $nodes,
                'edges' => $edges
            ]
        ]);
    }

    /**
     * Estatísticas dos mapas mentais
     */
    public function stats(): JsonResponse
    {
        $totalCampaigns = Campaign::count();
        $campaignsWithMindmap = Campaign::whereHas('mindmapNodes')->count();
        $totalNodes = MindmapNode::count();
        $totalEdges = MindmapEdge::count();

        $recentActivity = MindmapNode::with('campaign')
            ->orderBy('updated_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'total_campaigns' => $totalCampaigns,
                'campaigns_with_mindmap' => $campaignsWithMindmap,
                'mindmap_adoption_rate' => $totalCampaigns > 0 ? round(($campaignsWithMindmap / $totalCampaigns) * 100, 2) : 0,
                'total_nodes' => $totalNodes,
                'total_edges' => $totalEdges,
                'recent_activity' => $recentActivity
            ]
        ]);
    }

    /**
     * Deletar nó (admin)
     */
    public function deleteNode(Campaign $campaign, MindmapNode $node): JsonResponse
    {
        $node->delete();

        return response()->json([
            'success' => true,
            'message' => 'Nó deletado com sucesso!'
        ]);
    }

    /**
     * Deletar conexão (admin)
     */
    public function deleteEdge(Campaign $campaign, MindmapEdge $edge): JsonResponse
    {
        $edge->delete();

        return response()->json([
            'success' => true,
            'message' => 'Conexão deletada com sucesso!'
        ]);
    }

    /**
     * Exportar todos os mapas mentais
     */
    public function exportAll(): JsonResponse
    {
        $campaigns = Campaign::with([
            'owner',
            'mindmapNodes.files',
            'mindmapEdges.sourceNode',
            'mindmapEdges.targetNode'
        ])->whereHas('mindmapNodes')->get();

        $exportData = $campaigns->map(function ($campaign) {
            return [
                'campaign' => [
                    'id' => $campaign->id,
                    'name' => $campaign->name,
                    'owner' => $campaign->owner->name,
                    'created_at' => $campaign->created_at->toISOString()
                ],
                'nodes' => $campaign->mindmapNodes,
                'edges' => $campaign->mindmapEdges
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $exportData,
            'exported_at' => now()->toISOString(),
            'total_campaigns' => $campaigns->count()
        ]);
    }
}
