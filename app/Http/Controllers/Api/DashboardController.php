<?php

namespace App\Http\Controllers\Api;

use App\Models\Activity;
use App\Models\Deal;
use Illuminate\Http\JsonResponse;

class DashboardController extends BaseController
{
    public function stats(): JsonResponse
    {
        try {
            $totalRevenue = (float) Deal::where('status', 'won')->sum('value');
            $activeLeads = Deal::where('status', 'open')->count();
            $wonDealCount = Deal::where('status', 'won')->count();
            $dealVelocity = 0;

            if ($wonDealCount > 0) {
                $avgDays = Deal::where('status', 'won')
                    ->selectRaw('AVG(DATEDIFF(updated_at, created_at)) as avg_days')
                    ->value('avg_days');
                $dealVelocity = round((float) $avgDays, 1);
            }

            return $this->successResponse([
                'total_revenue' => $totalRevenue,
                'active_leads' => $activeLeads,
                'won_deal_count' => $wonDealCount,
                'deal_velocity' => $dealVelocity,
            ]);
        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to fetch dashboard stats.', 500);
        }
    }

    public function revenue(): JsonResponse
    {
        try {
            $data = Deal::where('status', 'won')
                ->selectRaw('DATE_FORMAT(updated_at, "%Y-%m") as month, SUM(value) as total')
                ->groupBy('month')
                ->orderBy('month')
                ->get();

            return $this->successResponse($data);
        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to fetch revenue data.', 500);
        }
    }

    public function activities(): JsonResponse
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
