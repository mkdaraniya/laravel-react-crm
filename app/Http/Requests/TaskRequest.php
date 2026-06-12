<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'status' => 'nullable|string|in:pending,completed',
            'priority' => 'nullable|string|in:low,medium,high',
            'user_id' => 'required|exists:users,id',
            'deal_id' => 'nullable|exists:deals,id',
            'contact_id' => 'nullable|exists:contacts,id',
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
