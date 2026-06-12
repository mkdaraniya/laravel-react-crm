<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends BaseController
{
    public function login(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'email' => 'required|email',
                'password' => 'required',
            ]);

            $user = User::where('email', $request->email)->first();

            if (!$user || !Hash::check($request->password, $user->password)) {
                return $this->errorResponse('The provided credentials are incorrect.', 401);
            }

            $token = $user->createToken('api-token')->plainTextToken;

            return $this->successResponse([
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ],
                'token' => $token,
            ]);
        } catch (ValidationException $e) {
            return $this->errorResponse('Validation failed.', 422, $e->errors());
        } catch (\Throwable $e) {
            return $this->errorResponse('Login failed. Please try again.', 500);
        }
    }

    public function register(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'password' => 'required|min:8|confirmed',
            ]);

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'user',
            ]);

            $token = $user->createToken('api-token')->plainTextToken;

            return $this->successResponse([
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ],
                'token' => $token,
            ], 'Account created successfully.', 201);
        } catch (ValidationException $e) {
            return $this->errorResponse('Validation failed.', 422, $e->errors());
        } catch (\Throwable $e) {
            return $this->errorResponse('Registration failed. Please try again.', 500);
        }
    }

    public function user(Request $request): JsonResponse
    {
        try {
            return $this->successResponse([
                'id' => $request->user()->id,
                'name' => $request->user()->name,
                'email' => $request->user()->email,
                'role' => $request->user()->role,
            ]);
        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to fetch user.', 500);
        }
    }

    public function logout(Request $request): JsonResponse
    {
        try {
            $request->user()->currentAccessToken()->delete();

            return $this->successResponse(null, 'Logged out successfully.');
        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to logout.', 500);
        }
    }

    public function updateProfile(Request $request): JsonResponse
    {
        try {
            $data = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email,' . $request->user()->id,
            ]);

            $request->user()->update($data);

            return $this->successResponse([
                'id' => $request->user()->id,
                'name' => $request->user()->name,
                'email' => $request->user()->email,
                'role' => $request->user()->role,
            ], 'Profile updated successfully.');
        } catch (ValidationException $e) {
            return $this->errorResponse('Validation failed.', 422, $e->errors());
        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to update profile.', 500);
        }
    }

    public function updatePassword(Request $request): JsonResponse
    {
        try {
            $data = $request->validate([
                'current_password' => 'required|current_password',
                'password' => 'required|min:8|confirmed',
            ]);

            $request->user()->update(['password' => Hash::make($data['password'])]);

            return $this->successResponse(null, 'Password updated successfully.');
        } catch (ValidationException $e) {
            return $this->errorResponse('Validation failed.', 422, $e->errors());
        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to update password.', 500);
        }
    }

    public function destroyAccount(Request $request): JsonResponse
    {
        try {
            $request->validate(['password' => 'required|current_password']);

            $user = $request->user();

            $user->tokens()->delete();
            $user->delete();

            return $this->successResponse(null, 'Account deleted successfully.');
        } catch (ValidationException $e) {
            return $this->errorResponse('Validation failed.', 422, $e->errors());
        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to delete account.', 500);
        }
    }
}
