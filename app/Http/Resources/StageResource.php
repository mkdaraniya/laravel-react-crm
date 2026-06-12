<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'order' => $this->order,
            'color' => $this->color,
            'deals_count' => $this->deals_count ?? 0,
            'deals' => DealResource::collection($this->whenLoaded('deals')),
            'created_at' => $this->created_at->toISOString(),
        ];
    }
}
