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
            'first_name' => 'required|string|max:100|regex:/^[a-zA-Z\s\-\'\.]+$/',
            'last_name' => 'required|string|max:100|regex:/^[a-zA-Z\s\-\'\.]+$/',
            'email' => 'nullable|email:filter|max:255',
            'phone' => 'nullable|string|max:20|regex:/^[\+\d\s\-\(\)\.]+$/',
            'company' => 'nullable|string|max:255',
            'position' => 'nullable|string|max:255',
            'status' => 'nullable|string|in:active,inactive,lead',
            'tags' => 'nullable|array|max:20',
            'tags.*' => 'string|max:50|regex:/^[a-zA-Z0-9\s\-_]+$/',
            'source' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:5000',
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
            'first_name.regex' => 'First name may only contain letters, spaces, hyphens, and apostrophes.',
            'last_name.regex' => 'Last name may only contain letters, spaces, hyphens, and apostrophes.',
            'phone.regex' => 'Phone number may only contain digits, spaces, hyphens, parentheses, and plus signs.',
            'tags.*.regex' => 'Tags may only contain letters, numbers, spaces, hyphens, and underscores.',
            'tags.max' => 'Maximum 20 tags allowed.',
            'notes.max' => 'Notes must not exceed 5000 characters.',
        ];
    }
}
