<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePostRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Decodificar JSON strings para arrays se necessário
        if ($this->has('tags') && is_string($this->tags)) {
            $this->merge([
                'tags' => json_decode($this->tags, true) ?? []
            ]);
        }

        if ($this->has('mentions') && is_string($this->mentions)) {
            $this->merge([
                'mentions' => json_decode($this->mentions, true) ?? []
            ]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'content' => 'required|string|max:2000',
            'visibility' => 'sometimes|string|in:public,private,friends',
            'reply_to_post_id' => 'sometimes|nullable|exists:posts,id',
            'media' => 'sometimes|array',
            'media.*' => 'sometimes|file|mimes:jpeg,png,jpg,gif,webp,mp4,avi,mov|max:10240', // 10MB max
            'mentions.*' => 'sometimes|exists:users,id',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'content.required' => 'O conteúdo do post é obrigatório.',
            'content.max' => 'O conteúdo do post não pode ter mais de 2000 caracteres.',
            'visibility.in' => 'A visibilidade deve ser: public, private ou friends.',
            'reply_to_post_id.exists' => 'O post de resposta não existe.',
            'media.*.file' => 'Cada arquivo de mídia deve ser um arquivo válido.',
            'media.*.mimes' => 'Os arquivos de mídia devem ser: jpeg, png, jpg, gif, mp4, avi ou mov.',
            'media.*.max' => 'Cada arquivo de mídia não pode ter mais de 10MB.',
            'mentions.*.exists' => 'Um ou mais usuários mencionados não existem.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'content' => 'conteúdo',
            'visibility' => 'visibilidade',
            'reply_to_post_id' => 'post de resposta',
            'media.*' => 'arquivo de mídia',
            'mentions.*' => 'menção',
        ];
    }
}
