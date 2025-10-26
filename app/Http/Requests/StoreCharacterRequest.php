<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCharacterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:100',
                'regex:/^[a-zA-ZÀ-ÿ\s\'-]+$/u', // Permite letras, espaços, hífens e apostrofes
            ],
            'level' => [
                'required',
                'integer',
                'min:1',
                'max:100',
            ],
            'summary' => [
                'nullable',
                'string',
                'max:1000',
            ],
            'backstory' => [
                'nullable',
                'string',
                'max:5000',
            ],
            'system' => [
                'required',
                'string',
                'max:100',
                'in:D&D 5e,D&D 3.5,Pathfinder,Pathfinder 2e,Call of Cthulhu,Vampire: The Masquerade,World of Darkness,GURPS,Savage Worlds,FATE,Cypher System,Powered by the Apocalypse,Outros',
            ],
            'campaign_ids' => [
                'nullable',
                'array',
            ],
            'campaign_ids.*' => [
                'integer',
                'exists:campaigns,id',
            ],
            'role_notes' => [
                'nullable',
                'array',
            ],
            'role_notes.*' => [
                'nullable',
                'string',
                'max:500',
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'O nome do personagem é obrigatório.',
            'name.regex' => 'O nome do personagem deve conter apenas letras, espaços, hífens e apostrofes.',
            'name.max' => 'O nome do personagem não pode ter mais de 100 caracteres.',
            
            'level.required' => 'O nível do personagem é obrigatório.',
            'level.integer' => 'O nível deve ser um número inteiro.',
            'level.min' => 'O nível mínimo é 1.',
            'level.max' => 'O nível máximo é 100.',
            
            'summary.max' => 'O resumo não pode ter mais de 1000 caracteres.',
            
            'backstory.max' => 'A história de fundo não pode ter mais de 5000 caracteres.',
            
            'system.required' => 'O sistema de RPG é obrigatório.',
            'system.in' => 'Sistema de RPG selecionado é inválido.',
            
            'campaign_ids.*.exists' => 'Uma das campanhas selecionadas não existe.',
            
            'role_notes.*.max' => 'As notas sobre papel não podem ter mais de 500 caracteres.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'name' => 'nome do personagem',
            'level' => 'nível',
            'summary' => 'resumo',
            'backstory' => 'história de fundo',
            'system' => 'sistema de RPG',
            'campaign_ids' => 'campanhas',
            'role_notes' => 'notas sobre papel',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // Verificar se o usuário tem acesso às campanhas selecionadas
            if ($this->filled('campaign_ids')) {
                $user = auth()->user();
                $campaignIds = $this->input('campaign_ids');
                
                $accessibleCampaigns = \App\Models\Campaign::where(function ($query) use ($user) {
                    $query->where('owner_id', $user->id)
                          ->orWhereHas('members', function ($subQuery) use ($user) {
                              $subQuery->where('user_id', $user->id);
                          });
                })->pluck('id')->toArray();
                
                foreach ($campaignIds as $campaignId) {
                    if (!in_array($campaignId, $accessibleCampaigns)) {
                        $validator->errors()->add('campaign_ids', 'Você não tem acesso a uma das campanhas selecionadas.');
                        break;
                    }
                }
            }

            // Verificar se o número de notas corresponde ao número de campanhas
            if ($this->filled('campaign_ids') && $this->filled('role_notes')) {
                $campaignCount = count($this->input('campaign_ids'));
                $notesCount = count($this->input('role_notes'));
                
                if ($notesCount > $campaignCount) {
                    $validator->errors()->add('role_notes', 'O número de notas não pode ser maior que o número de campanhas selecionadas.');
                }
            }
        });
    }
}
