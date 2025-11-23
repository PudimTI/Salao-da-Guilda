<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCampaignRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:150',
            'description' => 'nullable|string|max:5000',
            'system' => 'nullable|string|max:100',
            'type' => 'nullable|in:digital,presencial',
            'city' => 'nullable|string|max:100',
            'rules' => 'nullable|string|max:10000',
            'status' => 'required|in:open,closed,active,paused',
            'visibility' => 'required|in:public,private',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:tags,id',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'O nome da campanha é obrigatório.',
            'name.max' => 'O nome da campanha não pode ter mais de 150 caracteres.',
            'description.max' => 'A descrição não pode ter mais de 5000 caracteres.',
            'system.max' => 'O sistema não pode ter mais de 100 caracteres.',
            'type.in' => 'O tipo deve ser digital ou presencial.',
            'city.max' => 'A cidade não pode ter mais de 100 caracteres.',
            'rules.max' => 'As regras não podem ter mais de 10000 caracteres.',
            'status.required' => 'O status da campanha é obrigatório.',
            'status.in' => 'O status deve ser: aberto, fechado, ativo ou pausado.',
            'visibility.required' => 'A visibilidade da campanha é obrigatória.',
            'visibility.in' => 'A visibilidade deve ser pública ou privada.',
            'tags.array' => 'As tags devem ser um array.',
            'tags.*.exists' => 'Uma ou mais tags selecionadas são inválidas.',
        ];
    }
}
