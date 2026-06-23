<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\DealController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\PipelineStageController;
use App\Http\Controllers\Api\ActivityController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\SettingController;

Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:auth');
Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:auth');

Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/dashboard/revenue', [DashboardController::class, 'revenue']);
    Route::get('/dashboard/activities', [DashboardController::class, 'activities']);

    Route::apiResource('contacts', ContactController::class)->middleware('throttle:strict');
    Route::apiResource('deals', DealController::class)->middleware('throttle:strict');
    Route::patch('/deals/{deal}/move', [DealController::class, 'moveStage'])->middleware('throttle:strict');

    Route::apiResource('tasks', TaskController::class)->middleware('throttle:strict');
    Route::patch('/tasks/{task}/toggle', [TaskController::class, 'toggle'])->middleware('throttle:strict');

    Route::apiResource('invoices', InvoiceController::class)->middleware('throttle:strict');
    Route::patch('/invoices/{invoice}/mark-paid', [InvoiceController::class, 'markPaid'])->middleware('throttle:strict');

    Route::apiResource('stages', PipelineStageController::class)->middleware('throttle:strict');
    Route::post('/stages/reorder', [PipelineStageController::class, 'reorder'])->middleware('throttle:strict');

    Route::get('/users', [UserController::class, 'index'])->middleware('throttle:strict');
    Route::post('/users', [UserController::class, 'store'])->middleware('throttle:strict');
    Route::patch('/users/{user}/role', [UserController::class, 'updateRole'])->middleware('throttle:strict');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->middleware('throttle:strict');

    Route::get('/settings', [SettingController::class, 'index']);
    Route::post('/settings', [SettingController::class, 'update'])->middleware('throttle:strict');

    Route::patch('/profile', [AuthController::class, 'updateProfile'])->middleware('throttle:strict');
    Route::patch('/profile/password', [AuthController::class, 'updatePassword'])->middleware('throttle:strict');
    Route::delete('/profile', [AuthController::class, 'destroyAccount'])->middleware('throttle:strict');
});
