<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ContactRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'company' => 'nullable|string|max:255',
            'position' => 'nullable|string|max:255',
            'status' => 'nullable|string|in:active,inactive,lead',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'source' => 'nullable|string|max:255',
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
