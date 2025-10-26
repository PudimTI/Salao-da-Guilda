<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RemoveFriendshipRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'friend_id' => [
                'required',
                'integer',
                'exists:users,id',
                'different:' . auth()->id(),
            ]
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'friend_id.required' => 'O ID do amigo é obrigatório',
            'friend_id.integer' => 'O ID do amigo deve ser um número inteiro',
            'friend_id.exists' => 'Usuário não encontrado',
            'friend_id.different' => 'Você não pode remover a si mesmo da lista de amigos'
        ];
    }
}
