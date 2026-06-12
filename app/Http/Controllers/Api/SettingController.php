<?php

namespace App\Http\Controllers\Api;

use App\Models\CompanySetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingController extends BaseController
{
    public function index(): JsonResponse
    {
        try {
            $settings = CompanySetting::pluck('value', 'key');

            return $this->successResponse($settings);
        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to fetch settings.', 500);
        }
    }

    public function update(Request $request): JsonResponse
    {
        try {
            $data = $request->validate([
                'company_name' => 'nullable|string|max:255',
                'company_email' => 'nullable|email|max:255',
                'company_phone' => 'nullable|string|max:20',
                'company_address' => 'nullable|string',
            ]);

            foreach ($data as $key => $value) {
                CompanySetting::updateOrCreate(
                    ['key' => $key],
                    ['value' => $value ?? '']
                );
            }

            return $this->successResponse(null, 'Settings updated successfully.');
        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to update settings.', 500);
        }
    }
}
