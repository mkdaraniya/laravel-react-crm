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
            'value' => 'required|numeric|min:0',
            'contact_id' => 'nullable|exists:contacts,id',
            'pipeline_stage_id' => 'required|exists:pipeline_stages,id',
            'expected_close_date' => 'nullable|date',
            'status' => 'nullable|string|in:open,won,lost',
            'notes' => 'nullable|string',
        ];

        if ($this->isMethod('PATCH') || $this->isMethod('PUT')) {
            foreach ($rules as $key => $rule) {
                if (str_starts_with($rule, 'required')) {
                    $rules[$key] = str_replace('required', 'sometimes', $rule);
                }
            }
        }

        return $rules;
    }
}
