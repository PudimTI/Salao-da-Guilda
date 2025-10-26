<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RespondFriendRequestRequest extends FormRequest
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
            'request_id' => [
                'required',
                'integer',
                'exists:friend_requests,id'
            ],
            'action' => [
                'required',
                'string',
                Rule::in(['accept', 'reject'])
            ]
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'request_id.required' => 'O ID da solicitação é obrigatório',
            'request_id.integer' => 'O ID da solicitação deve ser um número inteiro',
            'request_id.exists' => 'Solicitação não encontrada',
            'action.required' => 'A ação é obrigatória',
            'action.string' => 'A ação deve ser um texto',
            'action.in' => 'A ação deve ser "accept" ou "reject"'
        ];
    }
}
