<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        try {
            $query = User::select('id', 'name', 'email', 'role', 'created_at');

            $sortField = $request->sort_field ?? 'created_at';
            $sortDir = $request->sort_dir === 'asc' ? 'asc' : 'desc';
            $allowedSorts = ['name', 'email', 'role', 'created_at'];
            if (!in_array($sortField, $allowedSorts)) {
                $sortField = 'created_at';
            }

            $users = $query->orderBy($sortField, $sortDir)->paginate($request->per_page ?? 15);

            return $this->successResponse(
                $users->items(),
                null,
                200,
                $this->paginationMeta($users)
            );
        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to fetch users.', 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $data = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'password' => 'required|min:8',
                'role' => 'required|in:admin,manager,user',
            ]);

            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'role' => $data['role'],
            ]);

            return $this->successResponse(
                ['id' => $user->id, 'name' => $user->name, 'email' => $user->email, 'role' => $user->role],
                'User created successfully.',
                201
            );
        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to create user.', 500);
        }
    }

    public function updateRole(Request $request, User $user): JsonResponse
    {
        try {
            $data = $request->validate(['role' => 'required|in:admin,manager,user']);

            $user->update($data);

            return $this->successResponse(
                ['id' => $user->id, 'name' => $user->name, 'email' => $user->email, 'role' => $user->role],
                'User role updated successfully.'
            );
        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to update user role.', 500);
        }
    }

    public function destroy(User $user): JsonResponse
    {
        try {
            if ($user->id === auth()->id()) {
                return $this->errorResponse('You cannot delete your own account.', 422);
            }

            $user->delete();

            return $this->successResponse(null, 'User deleted successfully.');
        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to delete user.', 500);
        }
    }
}
