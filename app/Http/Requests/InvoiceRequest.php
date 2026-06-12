<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class InvoiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'deal_id' => 'nullable|exists:deals,id',
            'contact_id' => 'nullable|exists:contacts,id',
            'amount' => 'required|numeric|min:0',
            'status' => 'nullable|string|in:paid,unpaid,overdue,cancelled',
            'due_date' => 'nullable|date',
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
