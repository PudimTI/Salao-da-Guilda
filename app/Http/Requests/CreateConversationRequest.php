<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateConversationRequest extends FormRequest
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
            'participants' => 'required|array|min:1|max:50',
            'participants.*' => 'integer|exists:users,id|different:' . auth()->id(),
            'title' => 'nullable|string|max:150',
            'type' => 'required|string|in:dm,group,campaign',
            'campaign_id' => 'nullable|integer|exists:campaigns,id|required_if:type,campaign'
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
            'participants.required' => 'É necessário selecionar pelo menos um participante.',
            'participants.array' => 'Os participantes devem ser uma lista.',
            'participants.min' => 'É necessário selecionar pelo menos um participante.',
            'participants.max' => 'Não é possível adicionar mais de 50 participantes.',
            'participants.*.exists' => 'Um ou mais participantes selecionados não existem.',
            'participants.*.different' => 'Você não pode se adicionar como participante.',
            'title.max' => 'O título da conversa não pode ter mais de 150 caracteres.',
            'type.required' => 'O tipo da conversa é obrigatório.',
            'type.in' => 'O tipo da conversa deve ser: dm, group ou campaign.',
            'campaign_id.required_if' => 'O ID da campanha é obrigatório para conversas de campanha.',
            'campaign_id.exists' => 'A campanha selecionada não existe.',
        ];
    }

    /**
     * Configure the validator instance.
     *
     * @param  \Illuminate\Validation\Validator  $validator
     * @return void
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // Validações adicionais
            if ($this->input('type') === 'dm' && count($this->input('participants', [])) > 1) {
                $validator->errors()->add('participants', 'Conversas DM devem ter apenas um participante além do criador.');
            }

            if ($this->input('type') === 'group' && count($this->input('participants', [])) < 2) {
                $validator->errors()->add('participants', 'Conversas em grupo devem ter pelo menos 2 participantes.');
            }
        });
    }
}
