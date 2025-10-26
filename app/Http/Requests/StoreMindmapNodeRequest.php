<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMindmapNodeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization is handled by controller
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => 'required|string|max:150',
            'notes' => 'nullable|string',
            'pos_x' => 'nullable|numeric',
            'pos_y' => 'nullable|numeric',
            'file_ids' => 'nullable|array',
            'file_ids.*' => 'exists:campaign_files,id'
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'title.required' => 'O título do nó é obrigatório.',
            'title.max' => 'O título não pode ter mais de 150 caracteres.',
            'pos_x.numeric' => 'A posição X deve ser um número.',
            'pos_y.numeric' => 'A posição Y deve ser um número.',
            'file_ids.array' => 'Os IDs dos arquivos devem ser um array.',
            'file_ids.*.exists' => 'Um ou mais arquivos não foram encontrados.'
        ];
    }
}
