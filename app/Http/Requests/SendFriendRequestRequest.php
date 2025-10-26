<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SendFriendRequestRequest extends FormRequest
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
            'user_id' => [
                'required',
                'integer',
                'exists:users,id',
                'different:' . auth()->id(),
            ],
            'message' => [
                'nullable',
                'string',
                'max:500'
            ]
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'user_id.required' => 'O ID do usuário é obrigatório',
            'user_id.integer' => 'O ID do usuário deve ser um número inteiro',
            'user_id.exists' => 'Usuário não encontrado',
            'user_id.different' => 'Você não pode enviar solicitação de amizade para si mesmo',
            'message.string' => 'A mensagem deve ser um texto',
            'message.max' => 'A mensagem não pode ter mais de 500 caracteres'
        ];
    }
}
