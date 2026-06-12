<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'due_date' => $this->due_date?->toISOString(),
            'status' => $this->status,
            'priority' => $this->priority,
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->id,
                'name' => $this->user->name,
            ]),
            'deal' => $this->whenLoaded('deal', fn () => [
                'id' => $this->deal->id,
                'name' => $this->deal->name,
            ]),
            'contact' => $this->whenLoaded('contact', fn () => [
                'id' => $this->contact->id,
                'first_name' => $this->contact->first_name,
                'last_name' => $this->contact->last_name,
            ]),
            'created_at' => $this->created_at->toISOString(),
        ];
    }
}
