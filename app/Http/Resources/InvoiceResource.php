<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InvoiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'invoice_number' => $this->invoice_number,
            'amount' => (float) $this->amount,
            'status' => $this->status,
            'due_date' => $this->due_date?->toISOString(),
            'paid_at' => $this->paid_at?->toISOString(),
            'contact' => $this->whenLoaded('contact', fn () => [
                'id' => $this->contact->id,
                'first_name' => $this->contact->first_name,
                'last_name' => $this->contact->last_name,
                'company' => $this->contact->company,
            ]),
            'deal' => $this->whenLoaded('deal', fn () => [
                'id' => $this->deal->id,
                'name' => $this->deal->name,
            ]),
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->id,
                'name' => $this->user->name,
            ]),
            'created_at' => $this->created_at->toISOString(),
        ];
    }
}
