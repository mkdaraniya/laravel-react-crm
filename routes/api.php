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

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/dashboard/revenue', [DashboardController::class, 'revenue']);
    Route::get('/dashboard/activities', [DashboardController::class, 'activities']);

    Route::apiResource('contacts', ContactController::class);
    Route::apiResource('deals', DealController::class);
    Route::patch('/deals/{deal}/move', [DealController::class, 'moveStage']);

    Route::apiResource('tasks', TaskController::class);
    Route::patch('/tasks/{task}/toggle', [TaskController::class, 'toggle']);

    Route::apiResource('invoices', InvoiceController::class);
    Route::patch('/invoices/{invoice}/mark-paid', [InvoiceController::class, 'markPaid']);

    Route::apiResource('stages', PipelineStageController::class);
    Route::post('/stages/reorder', [PipelineStageController::class, 'reorder']);

    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::patch('/users/{user}/role', [UserController::class, 'updateRole']);
    Route::delete('/users/{user}', [UserController::class, 'destroy']);

    Route::get('/settings', [SettingController::class, 'index']);
    Route::post('/settings', [SettingController::class, 'update']);

    Route::patch('/profile', [AuthController::class, 'updateProfile']);
    Route::patch('/profile/password', [AuthController::class, 'updatePassword']);
    Route::delete('/profile', [AuthController::class, 'destroyAccount']);
});
