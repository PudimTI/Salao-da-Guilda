<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BulkImportTagsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->hasRole('admin'); // Apenas administradores
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'tags' => [
                'required',
                'array',
                'min:1',
                'max:100',
            ],
            'tags.*.name' => [
                'required',
                'string',
                'max:100',
                'min:2',
            ],
            'tags.*.type' => [
                'nullable',
                'string',
                'max:30',
                'in:post,campaign,general',
            ],
            'tags.*.description' => [
                'nullable',
                'string',
                'max:500',
            ],
            'tags.*.synonyms' => [
                'nullable',
                'array',
                'max:10',
            ],
            'tags.*.synonyms.*' => [
                'string',
                'max:100',
                'distinct',
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'tags.required' => 'É necessário fornecer uma lista de tags.',
            'tags.min' => 'É necessário fornecer pelo menos uma tag.',
            'tags.max' => 'Você pode importar no máximo 100 tags por vez.',
            'tags.*.name.required' => 'O nome da tag é obrigatório.',
            'tags.*.name.max' => 'O nome da tag não pode ter mais de 100 caracteres.',
            'tags.*.name.min' => 'O nome da tag deve ter pelo menos 2 caracteres.',
            'tags.*.type.in' => 'O tipo deve ser: post, campaign ou general.',
            'tags.*.description.max' => 'A descrição não pode ter mais de 500 caracteres.',
            'tags.*.synonyms.max' => 'Você pode adicionar no máximo 10 sinônimos por tag.',
            'tags.*.synonyms.*.max' => 'Cada sinônimo não pode ter mais de 100 caracteres.',
            'tags.*.synonyms.*.distinct' => 'Os sinônimos devem ser únicos.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('tags')) {
            $tags = $this->tags;

            foreach ($tags as $index => $tag) {
                // Normalizar nome da tag
                if (isset($tag['name'])) {
                    $tags[$index]['name'] = trim($tag['name']);
                }

                // Normalizar sinônimos
                if (isset($tag['synonyms'])) {
                    $synonyms = array_filter(array_map('trim', $tag['synonyms']));
                    $synonyms = array_unique($synonyms);
                    $tags[$index]['synonyms'] = array_values($synonyms);
                }
            }

            $this->merge(['tags' => $tags]);
        }
    }
}
