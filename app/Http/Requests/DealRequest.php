<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DealRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'name' => 'required|string|max:255',
            'value' => 'required|numeric|min:0|max:999999999.99',
            'contact_id' => 'nullable|integer|exists:contacts,id',
            'pipeline_stage_id' => 'required|integer|exists:pipeline_stages,id',
            'expected_close_date' => 'nullable|date|after_or_equal:today',
            'status' => 'nullable|string|in:open,won,lost',
            'notes' => 'nullable|string|max:5000',
        ];

        if ($this->isMethod('PATCH') || $this->isMethod('PUT')) {
            $rules['name'] = 'sometimes|string|max:255';
            $rules['value'] = 'sometimes|numeric|min:0|max:999999999.99';
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'value.max' => 'Deal value must not exceed 999,999,999.99.',
            'expected_close_date.after_or_equal' => 'Expected close date must be today or a future date.',
            'notes.max' => 'Notes must not exceed 5000 characters.',
            'name.max' => 'Deal name must not exceed 255 characters.',
        ];
    }
}
