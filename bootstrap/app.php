<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );

        $exceptions->render(function (Throwable $e, Request $request) {
            if (!$request->is('api/*')) {
                return null;
            }

            $statusCode = match (true) {
                $e instanceof \Illuminate\Validation\ValidationException => 422,
                $e instanceof \Illuminate\Auth\AuthenticationException => 401,
                $e instanceof \Illuminate\Auth\Access\AuthorizationException => 403,
                $e instanceof \Illuminate\Database\Eloquent\ModelNotFoundException => 404,
                $e instanceof \Symfony\Component\HttpKernel\Exception\NotFoundHttpException => 404,
                $e instanceof \Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException => 405,
                $e instanceof \Illuminate\Http\Exceptions\ThrottleRequestsException => 429,
                default => 500,
            };

            $response = [
                'success' => false,
                'message' => $e->getMessage() ?: 'An unexpected error occurred.',
            ];

            if ($e instanceof \Illuminate\Validation\ValidationException) {
                $response['message'] = 'Validation failed.';
                $response['errors'] = $e->errors();
            }

            if ($statusCode === 500) {
                $response['message'] = 'An unexpected error occurred.';
            }

            if ($statusCode === 404) {
                $response['message'] = 'Resource not found.';
            }

            if ($statusCode === 401) {
                $response['message'] = 'Unauthenticated.';
            }

            if ($statusCode === 403) {
                $response['message'] = 'Forbidden.';
            }

            if ($statusCode === 429) {
                $response['message'] = 'Too many requests. Please try again later.';
            }

            if ($statusCode === 405) {
                $response['message'] = 'Method not allowed.';
            }

            return response()->json($response, $statusCode);
        });
    })->create();
