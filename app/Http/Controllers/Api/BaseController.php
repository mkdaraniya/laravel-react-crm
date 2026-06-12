<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

abstract class BaseController extends Controller
{
    protected function successResponse(mixed $data, ?string $message = null, int $statusCode = 200, ?array $meta = null, ?array $extra = null): JsonResponse
    {
        $response = ['success' => true, 'data' => $data];

        if ($message) {
            $response['message'] = $message;
        }

        if ($meta) {
            $response['meta'] = $meta;
        }

        if ($extra) {
            $response = array_merge($response, $extra);
        }

        return response()->json($response, $statusCode);
    }

    protected function errorResponse(string $message, int $statusCode = 400, mixed $errors = null): JsonResponse
    {
        $response = ['success' => false, 'message' => $message];

        if ($errors) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $statusCode);
    }

    protected function paginationMeta(\Illuminate\Contracts\Pagination\LengthAwarePaginator $paginator): array
    {
        return [
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
            'from' => $paginator->firstItem(),
            'to' => $paginator->lastItem(),
        ];
    }
}
