<?php

namespace App\Http\Requests;

use App\Models\Report;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateReportStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return $user !== null && $user->isModerator();
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'string', Rule::in(Report::STATUSES)],
            'resolution_notes' => ['nullable', 'string', 'max:2000'],
            'target_user_status' => ['nullable', 'string', Rule::in(['active', 'suspended', 'banned'])],
        ];
    }
}


