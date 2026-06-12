<?php

namespace App\Http\Controllers\Api;

use App\Models\Activity;
use Illuminate\Http\JsonResponse;

class ActivityController extends BaseController
{
    public function index(): JsonResponse
    {
        try {
            $activities = Activity::with('user:id,name')
                ->latest()
                ->take(50)
                ->get()
                ->map(fn ($a) => [
                    'id' => $a->id,
                    'user' => $a->user?->name ?? 'System',
                    'type' => $a->type,
                    'description' => $a->description,
                    'created_at' => $a->created_at->diffForHumans(),
                ]);

            return $this->successResponse($activities);
        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to fetch activities.', 500);
        }
    }
}
