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
            'title' => 'required|string|max:500',
            'description' => 'nullable|string|max:5000',
            'due_date' => 'nullable|date',
            'status' => 'nullable|string|in:pending,completed',
            'priority' => 'nullable|string|in:low,medium,high',
            'user_id' => 'required|integer|exists:users,id',
            'deal_id' => 'nullable|integer|exists:deals,id',
            'contact_id' => 'nullable|integer|exists:contacts,id',
        ];

        if ($this->isMethod('PATCH') || $this->isMethod('PUT')) {
            foreach ($rules as $key => $rule) {
                if (str_starts_with((string) $rule, 'required')) {
                    $rules[$key] = str_replace('required', 'sometimes', $rule);
                }
            }
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'title.max' => 'Task title must not exceed 500 characters.',
            'description.max' => 'Description must not exceed 5000 characters.',
        ];
    }
}
