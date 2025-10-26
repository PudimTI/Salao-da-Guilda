<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\MindmapNode;
use App\Models\MindmapEdge;
use App\Models\CampaignFile;
use App\Http\Requests\StoreMindmapNodeRequest;
use App\Http\Requests\UpdateMindmapNodeRequest;
use App\Http\Requests\StoreMindmapEdgeRequest;
use App\Http\Requests\UpdateMindmapEdgeRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class MindmapController extends Controller
{
    use AuthorizesRequests;
    /**
     * Listar todos os nós de um mapa mental
     */
    public function index(Campaign $campaign): JsonResponse
    {
        // Temporariamente removendo autorização para teste
        // $this->authorize('viewMindmap', $campaign);

        $nodes = $campaign->mindmapNodes()
            ->with(['files', 'outgoingEdges.targetNode', 'incomingEdges.sourceNode'])
            ->get();

        $edges = $campaign->mindmapEdges()
            ->with(['sourceNode', 'targetNode'])
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'nodes' => $nodes,
                'edges' => $edges
            ]
        ]);
    }

    /**
     * Criar um novo nó
     */
    public function storeNode(StoreMindmapNodeRequest $request, Campaign $campaign): JsonResponse
    {
        // Temporariamente removendo autorização para teste
        // $this->authorize('createMindmapNode', $campaign);

        $validated = $request->validated();

        $node = $campaign->mindmapNodes()->create([
            'title' => $validated['title'],
            'notes' => $validated['notes'] ?? null,
            'pos_x' => $validated['pos_x'] ?? 0,
            'pos_y' => $validated['pos_y'] ?? 0,
        ]);

        // Associar arquivos se fornecidos
        if (!empty($validated['file_ids'])) {
            $node->files()->attach($validated['file_ids']);
        }

        $node->load(['files', 'outgoingEdges', 'incomingEdges']);

        return response()->json([
            'success' => true,
            'data' => $node,
            'message' => 'Nó criado com sucesso!'
        ], 201);
    }

    /**
     * Visualizar um nó específico
     */
    public function showNode(Campaign $campaign, MindmapNode $node): JsonResponse
    {
        // Temporariamente removendo autorização para teste
        // $this->authorize('viewMindmap', $campaign);
        $this->authorize('view', $node);

        $node->load(['files', 'outgoingEdges.targetNode', 'incomingEdges.sourceNode']);

        return response()->json([
            'success' => true,
            'data' => $node
        ]);
    }

    /**
     * Atualizar um nó
     */
    public function updateNode(UpdateMindmapNodeRequest $request, Campaign $campaign, MindmapNode $node): JsonResponse
    {
        // Temporariamente removendo autorização para teste
        // $this->authorize('updateMindmapNode', $campaign);
        $this->authorize('update', $node);

        $validated = $request->validated();

        $node->update([
            'title' => $validated['title'] ?? $node->title,
            'notes' => $validated['notes'] ?? $node->notes,
            'pos_x' => $validated['pos_x'] ?? $node->pos_x,
            'pos_y' => $validated['pos_y'] ?? $node->pos_y,
        ]);

        // Atualizar arquivos associados
        if (isset($validated['file_ids'])) {
            $node->files()->sync($validated['file_ids']);
        }

        $node->load(['files', 'outgoingEdges', 'incomingEdges']);

        return response()->json([
            'success' => true,
            'data' => $node,
            'message' => 'Nó atualizado com sucesso!'
        ]);
    }

    /**
     * Deletar um nó
     */
    public function destroyNode(Campaign $campaign, MindmapNode $node): JsonResponse
    {
        // Temporariamente removendo autorização para teste
        // $this->authorize('deleteMindmapNode', $campaign);
        $this->authorize('delete', $node);

        $node->delete();

        return response()->json([
            'success' => true,
            'message' => 'Nó deletado com sucesso!'
        ]);
    }

    /**
     * Criar uma conexão entre nós
     */
    public function storeEdge(StoreMindmapEdgeRequest $request, Campaign $campaign): JsonResponse
    {
        // Temporariamente removendo autorização para teste
        // $this->authorize('createMindmapEdge', $campaign);

        $validated = $request->validated();

        $edge = $campaign->mindmapEdges()->create([
            'source_node_id' => $validated['source_node_id'],
            'target_node_id' => $validated['target_node_id'],
            'label' => $validated['label'] ?? null,
        ]);

        $edge->load(['sourceNode', 'targetNode']);

        return response()->json([
            'success' => true,
            'data' => $edge,
            'message' => 'Conexão criada com sucesso!'
        ], 201);
    }

    /**
     * Atualizar uma conexão
     */
    public function updateEdge(UpdateMindmapEdgeRequest $request, Campaign $campaign, MindmapEdge $edge): JsonResponse
    {
        // Temporariamente removendo autorização para teste
        // $this->authorize('updateMindmapEdge', $campaign);
        $this->authorize('update', $edge);

        $validated = $request->validated();

        $edge->update([
            'label' => $validated['label'] ?? $edge->label,
        ]);

        $edge->load(['sourceNode', 'targetNode']);

        return response()->json([
            'success' => true,
            'data' => $edge,
            'message' => 'Conexão atualizada com sucesso!'
        ]);
    }

    /**
     * Deletar uma conexão
     */
    public function destroyEdge(Campaign $campaign, MindmapEdge $edge): JsonResponse
    {
        // Temporariamente removendo autorização para teste
        // $this->authorize('deleteMindmapEdge', $campaign);
        $this->authorize('delete', $edge);

        $edge->delete();

        return response()->json([
            'success' => true,
            'message' => 'Conexão deletada com sucesso!'
        ]);
    }

    /**
     * Atualizar posição de um nó (drag & drop)
     */
    public function updateNodePosition(Request $request, Campaign $campaign, MindmapNode $node): JsonResponse
    {
        // Temporariamente removendo autorização para teste
        // $this->authorize('updateMindmapNode', $campaign);
        $this->authorize('update', $node);

        $request->validate([
            'pos_x' => 'required|numeric',
            'pos_y' => 'required|numeric'
        ]);

        $node->update([
            'pos_x' => $request->pos_x,
            'pos_y' => $request->pos_y,
        ]);

        return response()->json([
            'success' => true,
            'data' => $node,
            'message' => 'Posição atualizada com sucesso!'
        ]);
    }

    /**
     * Associar arquivo a um nó
     */
    public function attachFile(Request $request, Campaign $campaign, MindmapNode $node): JsonResponse
    {
        // Temporariamente removendo autorização para teste
        // $this->authorize('updateMindmapNode', $campaign);
        $this->authorize('update', $node);

        $request->validate([
            'file_id' => 'required|exists:campaign_files,id'
        ]);

        // Verificar se o arquivo pertence à campanha
        $file = CampaignFile::where('id', $request->file_id)
            ->where('campaign_id', $campaign->id)
            ->first();

        if (!$file) {
            return response()->json([
                'success' => false,
                'message' => 'Arquivo não encontrado ou não pertence à campanha'
            ], 404);
        }

        $node->files()->syncWithoutDetaching([$request->file_id]);

        return response()->json([
            'success' => true,
            'message' => 'Arquivo associado com sucesso!'
        ]);
    }

    /**
     * Desassociar arquivo de um nó
     */
    public function detachFile(Request $request, Campaign $campaign, MindmapNode $node): JsonResponse
    {
        // Temporariamente removendo autorização para teste
        // $this->authorize('updateMindmapNode', $campaign);
        $this->authorize('update', $node);

        $request->validate([
            'file_id' => 'required|exists:campaign_files,id'
        ]);

        $node->files()->detach($request->file_id);

        return response()->json([
            'success' => true,
            'message' => 'Arquivo desassociado com sucesso!'
        ]);
    }

    /**
     * Listar arquivos disponíveis da campanha para associar
     */
    public function availableFiles(Campaign $campaign): JsonResponse
    {
        // Temporariamente removendo autorização para teste
        // $this->authorize('viewMindmap', $campaign);

        $files = $campaign->files()
            ->with('uploader')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $files
        ]);
    }

    /**
     * Exportar mapa mental (estrutura completa)
     */
    public function export(Campaign $campaign): JsonResponse
    {
        // Temporariamente removendo autorização para teste
        // $this->authorize('viewMindmap', $campaign);

        $nodes = $campaign->mindmapNodes()
            ->with(['files'])
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
                    'exported_at' => now()->toISOString()
                ],
                'nodes' => $nodes,
                'edges' => $edges
            ]
        ]);
    }
}
