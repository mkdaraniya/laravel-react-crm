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
            'deal_id' => 'nullable|integer|exists:deals,id',
            'contact_id' => 'nullable|integer|exists:contacts,id',
            'amount' => 'required|numeric|min:0|max:999999999.99',
            'status' => 'nullable|string|in:paid,unpaid,overdue,cancelled',
            'due_date' => 'nullable|date',
        ];

        if ($this->isMethod('PATCH') || $this->isMethod('PUT')) {
            $rules['amount'] = 'sometimes|numeric|min:0|max:999999999.99';
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'amount.max' => 'Invoice amount must not exceed 999,999,999.99.',
        ];
    }
}
