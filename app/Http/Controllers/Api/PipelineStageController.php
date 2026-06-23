<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\StageRequest;
use App\Http\Resources\StageResource;
use App\Models\PipelineStage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class PipelineStageController extends BaseController
{
    public function index(): JsonResponse
    {
        try {
            $stages = PipelineStage::withCount(['deals' => function ($q) {
                $q->where('status', 'open');
            }])->orderBy('order')->get();

            return $this->successResponse(StageResource::collection($stages));
        } catch (\Throwable $e) {
            report($e);
            return $this->errorResponse('Failed to fetch stages.', 500);
        }
    }

    public function store(StageRequest $request): JsonResponse
    {
        try {
            $maxOrder = PipelineStage::max('order') ?? 0;

            $stage = PipelineStage::create([
                'name' => $request->name,
                'color' => $request->color ?? '#6366f1',
                'order' => $maxOrder + 1,
            ]);

            return $this->successResponse(
                new StageResource($stage),
                'Stage created successfully.',
                201
            );
        } catch (ValidationException $e) {
            return $this->errorResponse('Validation failed.', 422, $e->errors());
        } catch (\Throwable $e) {
            report($e);
            return $this->errorResponse('Failed to create stage.', 500);
        }
    }

    public function update(StageRequest $request, PipelineStage $pipelineStage): JsonResponse
    {
        try {
            $pipelineStage->update($request->validated());

            return $this->successResponse(
                new StageResource($pipelineStage),
                'Stage updated successfully.'
            );
        } catch (ValidationException $e) {
            return $this->errorResponse('Validation failed.', 422, $e->errors());
        } catch (\Throwable $e) {
            report($e);
            return $this->errorResponse('Failed to update stage.', 500);
        }
    }

    public function reorder(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'stages' => 'required|array|max:50',
                'stages.*.id' => 'required|integer|exists:pipeline_stages,id',
                'stages.*.order' => 'required|integer|min:0|max:1000',
            ]);

            foreach ($request->stages as $data) {
                PipelineStage::where('id', $data['id'])->update(['order' => $data['order']]);
            }

            return $this->successResponse(null, 'Stages reordered successfully.');
        } catch (ValidationException $e) {
            return $this->errorResponse('Validation failed.', 422, $e->errors());
        } catch (\Throwable $e) {
            report($e);
            return $this->errorResponse('Failed to reorder stages.', 500);
        }
    }

    public function destroy(PipelineStage $pipelineStage): JsonResponse
    {
        try {
            $pipelineStage->delete();

            return $this->successResponse(null, 'Stage deleted successfully.');
        } catch (\Throwable $e) {
            report($e);
            return $this->errorResponse('Failed to delete stage.', 500);
        }
    }
}
