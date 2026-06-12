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
            'name' => 'required|string|max:255',
            'color' => 'nullable|string|max:7',
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
