<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        if ($user === null) {
            return false;
        }

        return $user->status !== 'banned';
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('target_type')) {
            $this->merge([
                'target_type' => strtolower((string) $this->get('target_type')),
            ]);
        }
    }

    public function rules(): array
    {
        $targetTypes = array_keys(config('reports.targets', []));

        return [
            'target_type' => ['required', 'string', Rule::in($targetTypes)],
            'target_id' => ['required', 'integer', 'min:1'],
            'reason_text' => ['required', 'string', 'min:' . (int) config('reports.reason_min_length', 10), 'max:2000'],
            'evidence_urls' => ['nullable', 'array', 'max:5'],
            'evidence_urls.*' => ['string', 'url', 'max:2048'],
        ];
    }
}


