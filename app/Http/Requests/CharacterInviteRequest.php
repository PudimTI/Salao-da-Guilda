<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CharacterInviteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'character_id' => 'required|exists:characters,id',
            'message' => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'character_id.required' => 'O personagem é obrigatório.',
            'character_id.exists' => 'O personagem selecionado não existe.',
            'message.max' => 'A mensagem não pode ter mais de 500 caracteres.',
        ];
    }
}
