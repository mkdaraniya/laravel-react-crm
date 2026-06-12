<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\TaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Activity;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TaskController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Task::with(['user:id,name', 'deal:id,name', 'contact:id,first_name,last_name']);

            if ($request->status) {
                $query->where('status', $request->status);
            }

            if ($request->priority) {
                $query->where('priority', $request->priority);
            }

            if ($request->user_id) {
                $query->where('user_id', $request->user_id);
            }

            $sortField = $request->sort_field ?? 'created_at';
            $sortDir = $request->sort_dir === 'asc' ? 'asc' : 'desc';
            $allowedSorts = ['title', 'status', 'priority', 'due_date', 'created_at'];
            if (!in_array($sortField, $allowedSorts)) {
                $sortField = 'created_at';
            }

            $tasks = $query->orderBy($sortField, $sortDir)->paginate($request->per_page ?? 15);

            return $this->successResponse(
                TaskResource::collection($tasks),
                null,
                200,
                $this->paginationMeta($tasks)
            );
        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to fetch tasks.', 500);
        }
    }

    public function store(TaskRequest $request): JsonResponse
    {
        try {
            $task = DB::transaction(function () use ($request) {
                $task = Task::create([
                    ...$request->validated(),
                    'created_by' => auth()->id(),
                ]);

                Activity::create([
                    'user_id' => auth()->id(),
                    'deal_id' => $task->deal_id,
                    'contact_id' => $task->contact_id,
                    'type' => 'task_created',
                    'description' => "Task \"{$task->title}\" created",
                ]);

                return $task;
            });

            return $this->successResponse(
                new TaskResource($task->load(['user:id,name', 'deal:id,name', 'contact:id,first_name,last_name'])),
                'Task created successfully.',
                201
            );
        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to create task.', 500);
        }
    }

    public function show(Task $task): JsonResponse
    {
        try {
            $task->load(['user:id,name', 'deal:id,name', 'contact:id,first_name,last_name']);

            return $this->successResponse(new TaskResource($task));
        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to fetch task.', 500);
        }
    }

    public function update(TaskRequest $request, Task $task): JsonResponse
    {
        try {
            $oldStatus = $task->status;
            $task->update($request->validated());

            if ($task->status === 'completed' && $oldStatus !== 'completed') {
                Activity::create([
                    'user_id' => auth()->id(),
                    'deal_id' => $task->deal_id,
                    'contact_id' => $task->contact_id,
                    'type' => 'task_completed',
                    'description' => "Task \"{$task->title}\" completed",
                ]);
            }

            return $this->successResponse(
                new TaskResource($task->load(['user:id,name', 'deal:id,name', 'contact:id,first_name,last_name'])),
                'Task updated successfully.'
            );
        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to update task.', 500);
        }
    }

    public function toggle(Task $task): JsonResponse
    {
        try {
            $task->update(['status' => $task->status === 'completed' ? 'pending' : 'completed']);

            if ($task->status === 'completed') {
                Activity::create([
                    'user_id' => auth()->id(),
                    'deal_id' => $task->deal_id,
                    'contact_id' => $task->contact_id,
                    'type' => 'task_completed',
                    'description' => "Task \"{$task->title}\" completed",
                ]);
            }

            return $this->successResponse(
                new TaskResource($task),
                'Task updated successfully.'
            );
        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to toggle task.', 500);
        }
    }

    public function destroy(Task $task): JsonResponse
    {
        try {
            $task->delete();

            return $this->successResponse(null, 'Task deleted successfully.');
        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to delete task.', 500);
        }
    }
}
