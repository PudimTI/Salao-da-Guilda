<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMindmapEdgeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization is handled by controller
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'source_node_id' => 'required|exists:mindmap_nodes,id',
            'target_node_id' => 'required|exists:mindmap_nodes,id|different:source_node_id',
            'label' => 'nullable|string|max:100'
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'source_node_id.required' => 'O nó de origem é obrigatório.',
            'source_node_id.exists' => 'O nó de origem não foi encontrado.',
            'target_node_id.required' => 'O nó de destino é obrigatório.',
            'target_node_id.exists' => 'O nó de destino não foi encontrado.',
            'target_node_id.different' => 'O nó de destino deve ser diferente do nó de origem.',
            'label.max' => 'O rótulo não pode ter mais de 100 caracteres.'
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $sourceNodeId = $this->input('source_node_id');
            $targetNodeId = $this->input('target_node_id');
            
            if ($sourceNodeId && $targetNodeId) {
                // Verificar se ambos os nós pertencem à mesma campanha
                $campaignId = $this->route('campaign')->id;
                
                $sourceNode = \App\Models\MindmapNode::where('id', $sourceNodeId)
                    ->where('campaign_id', $campaignId)
                    ->exists();
                    
                $targetNode = \App\Models\MindmapNode::where('id', $targetNodeId)
                    ->where('campaign_id', $campaignId)
                    ->exists();
                
                if (!$sourceNode) {
                    $validator->errors()->add('source_node_id', 'O nó de origem não pertence à campanha.');
                }
                
                if (!$targetNode) {
                    $validator->errors()->add('target_node_id', 'O nó de destino não pertence à campanha.');
                }
                
                // Verificar se já existe uma conexão entre estes nós
                if ($sourceNode && $targetNode) {
                    $existingEdge = \App\Models\MindmapEdge::where('campaign_id', $campaignId)
                        ->where('source_node_id', $sourceNodeId)
                        ->where('target_node_id', $targetNodeId)
                        ->exists();
                        
                    if ($existingEdge) {
                        $validator->errors()->add('target_node_id', 'Já existe uma conexão entre estes nós.');
                    }
                }
            }
        });
    }
}
