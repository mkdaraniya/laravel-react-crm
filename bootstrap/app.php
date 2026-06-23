<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;

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

        $middleware->api(prepend: [
            \App\Http\Middleware\SanitizeInput::class,
            \App\Http\Middleware\SecurityHeaders::class,
        ]);
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
                $e instanceof \Symfony\Component\HttpKernel\Exception\HttpException => $e->getStatusCode(),
                default => 500,
            };

            $message = match ($statusCode) {
                422 => 'Validation failed.',
                401 => 'Unauthenticated.',
                403 => 'Forbidden.',
                404 => 'Resource not found.',
                405 => 'Method not allowed.',
                429 => 'Too many requests. Please try again later.',
                default => 'An unexpected error occurred.',
            };

            $response = [
                'success' => false,
                'message' => $message,
            ];

            if ($e instanceof \Illuminate\Validation\ValidationException) {
                $response['errors'] = $e->errors();
            }

            if ($statusCode >= 500) {
                report($e);
            }

            return response()->json($response, $statusCode);
        });
    })->create();
