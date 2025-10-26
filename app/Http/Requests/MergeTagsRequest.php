<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class MergeTagsRequest extends FormRequest
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
            'source_tag_ids' => [
                'required',
                'array',
                'min:1',
                'max:10',
            ],
            'source_tag_ids.*' => [
                'integer',
                'exists:tags,id',
            ],
            'target_tag_id' => [
                'required',
                'integer',
                'exists:tags,id',
                Rule::notIn($this->input('source_tag_ids', [])),
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'source_tag_ids.required' => 'É necessário especificar as tags fonte.',
            'source_tag_ids.min' => 'É necessário especificar pelo menos uma tag fonte.',
            'source_tag_ids.max' => 'Você pode especificar no máximo 10 tags fonte.',
            'source_tag_ids.*.exists' => 'Uma ou mais tags fonte não existem.',
            'target_tag_id.required' => 'É necessário especificar a tag alvo.',
            'target_tag_id.exists' => 'A tag alvo não existe.',
            'target_tag_id.not_in' => 'A tag alvo não pode estar entre as tags fonte.',
        ];
    }
}
