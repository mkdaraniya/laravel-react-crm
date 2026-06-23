<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class UserController extends BaseController
{
    private function isDemoUser(User $user): bool
    {
        return $user->email === config('demo.email');
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'sort_field' => 'nullable|string|in:name,email,role,created_at',
                'sort_dir' => 'nullable|string|in:asc,desc',
                'per_page' => 'nullable|integer|min:1|max:100',
            ]);

            $query = User::select('id', 'name', 'email', 'role', 'created_at', 'created_by')
                ->with('creator:id,name');

            $sortField = $request->sort_field ?? 'created_at';
            $sortDir = $request->sort_dir === 'asc' ? 'asc' : 'desc';
            $allowedSorts = ['name', 'email', 'role', 'created_at'];
            if (!in_array($sortField, $allowedSorts)) {
                $sortField = 'created_at';
            }

            $users = $query->orderBy($sortField, $sortDir)->paginate(min((int) ($request->per_page ?? 15), 100));

            return $this->successResponse(
                $users->items(),
                null,
                200,
                $this->paginationMeta($users)
            );
        } catch (ValidationException $e) {
            return $this->errorResponse('Validation failed.', 422, $e->errors());
        } catch (\Throwable $e) {
            report($e);
            return $this->errorResponse('Failed to fetch users.', 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $data = $request->validate([
                'name' => 'required|string|max:255|regex:/^[a-zA-Z\s\-\'\.]+$/',
                'email' => 'required|email:filter|unique:users,email',
                'password' => 'required|string|min:8|max:255',
                'role' => 'required|string|in:admin,manager,user',
            ]);

            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'role' => $data['role'],
                'created_by' => auth()->id(),
            ]);

            return $this->successResponse(
                [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'created_by' => $user->created_by,
                ],
                'User created successfully.',
                201
            );
        } catch (ValidationException $e) {
            return $this->errorResponse('Validation failed.', 422, $e->errors());
        } catch (\Throwable $e) {
            report($e);
            return $this->errorResponse('Failed to create user.', 500);
        }
    }

    public function updateRole(Request $request, User $user): JsonResponse
    {
        try {
            if ($this->isDemoUser($user)) {
                return $this->errorResponse('Demo account role cannot be changed.', 403);
            }

            if ($user->created_by !== auth()->id()) {
                return $this->errorResponse('You can only manage users you created.', 403);
            }

            $data = $request->validate([
                'role' => 'required|string|in:admin,manager,user',
            ]);

            $user->update($data);

            return $this->successResponse(
                ['id' => $user->id, 'name' => $user->name, 'email' => $user->email, 'role' => $user->role],
                'User role updated successfully.'
            );
        } catch (ValidationException $e) {
            return $this->errorResponse('Validation failed.', 422, $e->errors());
        } catch (\Throwable $e) {
            report($e);
            return $this->errorResponse('Failed to update user role.', 500);
        }
    }

    public function destroy(User $user): JsonResponse
    {
        try {
            if ($user->id === auth()->id()) {
                return $this->errorResponse('You cannot delete your own account.', 422);
            }

            if ($this->isDemoUser($user)) {
                return $this->errorResponse('Demo account cannot be deleted.', 403);
            }

            if ($user->created_by !== auth()->id()) {
                return $this->errorResponse('You can only delete users you created.', 403);
            }

            $user->delete();

            return $this->successResponse(null, 'User deleted successfully.');
        } catch (\Throwable $e) {
            report($e);
            return $this->errorResponse('Failed to delete user.', 500);
        }
    }
}
