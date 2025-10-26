<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class JoinCampaignRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->id === $this->route('character')->user_id;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'campaign_id' => [
                'required',
                'integer',
                'exists:campaigns,id',
            ],
            'role_note' => [
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
            'campaign_id.required' => 'A campanha é obrigatória.',
            'campaign_id.exists' => 'A campanha selecionada não existe.',
            
            'role_note.max' => 'A nota sobre o papel não pode ter mais de 500 caracteres.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'campaign_id' => 'campanha',
            'role_note' => 'nota sobre o papel',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $campaignId = $this->input('campaign_id');
            $character = $this->route('character');
            $user = auth()->user();
            
            if ($campaignId) {
                // Verificar se o usuário tem acesso à campanha
                $campaign = \App\Models\Campaign::find($campaignId);
                
                if ($campaign) {
                    $hasAccess = $campaign->owner_id === $user->id || 
                                $campaign->members()->where('user_id', $user->id)->exists();
                    
                    if (!$hasAccess) {
                        $validator->errors()->add('campaign_id', 'Você não tem acesso a esta campanha.');
                    }
                    
                    // Verificar se o personagem já está na campanha
                    if ($character->campaigns()->where('campaign_id', $campaignId)->exists()) {
                        $validator->errors()->add('campaign_id', 'Este personagem já está nesta campanha.');
                    }
                    
                    // Verificar se a campanha está ativa
                    if ($campaign->status !== 'active') {
                        $validator->errors()->add('campaign_id', 'Esta campanha não está ativa.');
                    }
                }
            }
        });
    }
}
