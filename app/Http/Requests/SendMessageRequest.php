<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SendMessageRequest extends FormRequest
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
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'content' => 'required_without:media|string|max:5000',
            'media' => 'nullable|file|mimes:jpg,jpeg,png,gif,mp4,mp3,pdf,doc,docx|max:10240', // 10MB
            'reply_to' => 'nullable|integer|exists:messages,id'
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'content.required_without' => 'O conteúdo da mensagem é obrigatório quando nenhuma mídia é enviada.',
            'content.max' => 'O conteúdo da mensagem não pode ter mais de 5000 caracteres.',
            'media.file' => 'O arquivo de mídia deve ser um arquivo válido.',
            'media.mimes' => 'O arquivo deve ser do tipo: jpg, jpeg, png, gif, mp4, mp3, pdf, doc, docx.',
            'media.max' => 'O arquivo não pode ser maior que 10MB.',
            'reply_to.exists' => 'A mensagem para responder não foi encontrada.',
        ];
    }
}
