<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DealResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'value' => (float) $this->value,
            'expected_close_date' => $this->expected_close_date?->toISOString(),
            'status' => $this->status,
            'notes' => $this->notes,
            'contact' => $this->whenLoaded('contact', fn () => [
                'id' => $this->contact->id,
                'first_name' => $this->contact->first_name,
                'last_name' => $this->contact->last_name,
                'company' => $this->contact->company,
            ]),
            'stage' => $this->whenLoaded('stage', fn () => [
                'id' => $this->stage->id,
                'name' => $this->stage->name,
                'order' => $this->stage->order,
            ]),
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->id,
                'name' => $this->user->name,
            ]),
            'created_at' => $this->created_at->toISOString(),
        ];
    }
}
