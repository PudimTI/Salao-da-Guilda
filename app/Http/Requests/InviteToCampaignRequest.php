<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class InviteToCampaignRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => 'required|email|exists:users,email',
            'message' => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'O email é obrigatório.',
            'email.email' => 'O email deve ter um formato válido.',
            'email.exists' => 'Usuário não encontrado com este email.',
            'message.max' => 'A mensagem não pode ter mais de 500 caracteres.',
        ];
    }
}
