<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\DealRequest;
use App\Http\Resources\DealResource;
use App\Http\Resources\StageResource;
use App\Models\Activity;
use App\Models\Deal;
use App\Models\PipelineStage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class DealController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'search' => 'nullable|string|max:255',
            ]);

            $stages = PipelineStage::with(['deals' => function ($q) {
                $q->with('contact:id,first_name,last_name,company')
                  ->where('user_id', auth()->id())
                  ->where('status', 'open')
                  ->orderBy('created_at', 'desc');
            }])->orderBy('order')->get();

            return $this->successResponse(StageResource::collection($stages));
        } catch (\Throwable $e) {
            report($e);
            return $this->errorResponse('Failed to fetch deals.', 500);
        }
    }

    public function store(DealRequest $request): JsonResponse
    {
        try {
            $deal = DB::transaction(function () use ($request) {
                $deal = Deal::create([
                    ...$request->validated(),
                    'user_id' => auth()->id(),
                    'status' => 'open',
                ]);

                Activity::create([
                    'user_id' => auth()->id(),
                    'deal_id' => $deal->id,
                    'type' => 'deal_created',
                    'description' => "Deal \"{$deal->name}\" created",
                ]);

                return $deal;
            });

            return $this->successResponse(
                new DealResource($deal),
                'Deal created successfully.',
                201
            );
        } catch (ValidationException $e) {
            return $this->errorResponse('Validation failed.', 422, $e->errors());
        } catch (\Throwable $e) {
            report($e);
            return $this->errorResponse('Failed to create deal.', 500);
        }
    }

    public function show(Deal $deal): JsonResponse
    {
        try {
            if ($deal->user_id !== auth()->id()) {
                return $this->errorResponse('Deal not found.', 404);
            }

            $deal->load('contact:id,first_name,last_name,company', 'stage:id,name');

            return $this->successResponse(new DealResource($deal));
        } catch (\Throwable $e) {
            report($e);
            return $this->errorResponse('Failed to fetch deal.', 500);
        }
    }

    public function update(DealRequest $request, Deal $deal): JsonResponse
    {
        try {
            if ($deal->user_id !== auth()->id()) {
                return $this->errorResponse('Deal not found.', 404);
            }

            $oldStatus = $deal->status;
            $deal->update($request->validated());

            if ($request->has('status') && $request->status !== $oldStatus) {
                $type = $request->status === 'won' ? 'deal_won' : 'deal_lost';
                $msg = $request->status === 'won'
                    ? "Deal \"{$deal->name}\" won for \$" . number_format($deal->value, 2)
                    : "Deal \"{$deal->name}\" lost";

                Activity::create([
                    'user_id' => auth()->id(),
                    'deal_id' => $deal->id,
                    'type' => $type,
                    'description' => $msg,
                ]);
            }

            return $this->successResponse(
                new DealResource($deal),
                'Deal updated successfully.'
            );
        } catch (ValidationException $e) {
            return $this->errorResponse('Validation failed.', 422, $e->errors());
        } catch (\Throwable $e) {
            report($e);
            return $this->errorResponse('Failed to update deal.', 500);
        }
    }

    public function moveStage(Request $request, Deal $deal): JsonResponse
    {
        try {
            if ($deal->user_id !== auth()->id()) {
                return $this->errorResponse('Deal not found.', 404);
            }

            $request->validate([
                'pipeline_stage_id' => 'required|integer|exists:pipeline_stages,id',
            ]);

            $oldStage = $deal->stage;
            $deal->update(['pipeline_stage_id' => $request->pipeline_stage_id]);
            $newStage = PipelineStage::find($request->pipeline_stage_id);

            Activity::create([
                'user_id' => auth()->id(),
                'deal_id' => $deal->id,
                'type' => 'deal_moved',
                'description' => "Deal \"{$deal->name}\" moved from \"{$oldStage->name}\" to \"{$newStage->name}\"",
            ]);

            return $this->successResponse(null, 'Deal moved successfully.');
        } catch (ValidationException $e) {
            return $this->errorResponse('Validation failed.', 422, $e->errors());
        } catch (\Throwable $e) {
            report($e);
            return $this->errorResponse('Failed to move deal.', 500);
        }
    }

    public function destroy(Deal $deal): JsonResponse
    {
        try {
            if ($deal->user_id !== auth()->id()) {
                return $this->errorResponse('Deal not found.', 404);
            }

            $deal->delete();

            return $this->successResponse(null, 'Deal deleted successfully.');
        } catch (\Throwable $e) {
            report($e);
            return $this->errorResponse('Failed to delete deal.', 500);
        }
    }
}
