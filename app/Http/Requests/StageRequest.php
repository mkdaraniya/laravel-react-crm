<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'name' => 'required|string|max:100',
            'color' => 'nullable|string|max:7|regex:/^#[a-fA-F0-9]{6}$/',
        ];

        if ($this->isMethod('PATCH') || $this->isMethod('PUT')) {
            $rules['name'] = 'sometimes|string|max:100';
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'color.regex' => 'Color must be a valid hex color code (e.g. #6366f1).',
            'name.max' => 'Stage name must not exceed 100 characters.',
        ];
    }
}
