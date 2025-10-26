<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTagRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Será controlado pela policy
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:100',
                'min:2',
                Rule::unique('tags', 'name'),
            ],
            'type' => [
                'nullable',
                'string',
                'max:30',
                Rule::in(['post', 'campaign', 'general']),
            ],
            'description' => [
                'nullable',
                'string',
                'max:500',
            ],
            'synonyms' => [
                'nullable',
                'array',
                'max:10',
            ],
            'synonyms.*' => [
                'string',
                'max:100',
                'distinct',
            ],
            'is_moderated' => [
                'boolean',
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'O nome da tag é obrigatório.',
            'name.unique' => 'Uma tag com este nome já existe.',
            'name.max' => 'O nome da tag não pode ter mais de 100 caracteres.',
            'name.min' => 'O nome da tag deve ter pelo menos 2 caracteres.',
            'type.in' => 'O tipo deve ser: post, campaign ou general.',
            'description.max' => 'A descrição não pode ter mais de 500 caracteres.',
            'synonyms.max' => 'Você pode adicionar no máximo 10 sinônimos.',
            'synonyms.*.max' => 'Cada sinônimo não pode ter mais de 100 caracteres.',
            'synonyms.*.distinct' => 'Os sinônimos devem ser únicos.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Normalizar nome da tag
        if ($this->has('name')) {
            $this->merge([
                'name' => trim($this->name),
            ]);
        }

        // Normalizar sinônimos
        if ($this->has('synonyms')) {
            $synonyms = array_filter(array_map('trim', $this->synonyms));
            $synonyms = array_unique($synonyms);
            $this->merge(['synonyms' => array_values($synonyms)]);
        }
    }
}
