<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\ContactRequest;
use App\Http\Resources\ContactResource;
use App\Models\Activity;
use App\Models\Contact;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ContactController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'search' => 'nullable|string|max:255',
                'status' => 'nullable|string|in:active,inactive,lead',
                'user_id' => 'nullable|integer|exists:users,id',
                'sort_field' => 'nullable|string|in:first_name,last_name,email,company,status,created_at',
                'sort_dir' => 'nullable|string|in:asc,desc',
                'per_page' => 'nullable|integer|min:1|max:100',
            ]);

            $query = Contact::with('user:id,name')->where('user_id', auth()->id());

            if ($search = $request->search) {
                $query->where(function ($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                      ->orWhere('last_name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('company', 'like', "%{$search}%");
                });
            }

            if ($request->status) {
                $query->where('status', $request->status);
            }

            if ($request->user_id) {
                $query->where('user_id', $request->user_id);
            }

            $sortField = $request->sort_field ?? 'created_at';
            $sortDir = $request->sort_dir === 'asc' ? 'asc' : 'desc';
            $allowedSorts = ['first_name', 'last_name', 'email', 'company', 'status', 'created_at'];
            if (!in_array($sortField, $allowedSorts)) {
                $sortField = 'created_at';
            }

            $contacts = $query->orderBy($sortField, $sortDir)->paginate(min((int) ($request->per_page ?? 15), 100));

            return $this->successResponse(
                ContactResource::collection($contacts),
                null,
                200,
                $this->paginationMeta($contacts)
            );
        } catch (ValidationException $e) {
            return $this->errorResponse('Validation failed.', 422, $e->errors());
        } catch (\Throwable $e) {
            report($e);
            return $this->errorResponse('Failed to fetch contacts.', 500);
        }
    }

    public function store(ContactRequest $request): JsonResponse
    {
        try {
            $contact = DB::transaction(function () use ($request) {
                $contact = Contact::create([
                    ...$request->validated(),
                    'user_id' => auth()->id(),
                ]);

                Activity::create([
                    'user_id' => auth()->id(),
                    'contact_id' => $contact->id,
                    'type' => 'contact_created',
                    'description' => "Contact {$contact->full_name} created",
                ]);

                return $contact;
            });

            return $this->successResponse(
                new ContactResource($contact),
                'Contact created successfully.',
                201
            );
        } catch (ValidationException $e) {
            return $this->errorResponse('Validation failed.', 422, $e->errors());
        } catch (\Throwable $e) {
            report($e);
            return $this->errorResponse('Failed to create contact.', 500);
        }
    }

    public function show(Contact $contact): JsonResponse
    {
        try {
            if ($contact->user_id !== auth()->id()) {
                return $this->errorResponse('Contact not found.', 404);
            }

            $contact->load('user:id,name');

            return $this->successResponse(new ContactResource($contact));
        } catch (\Throwable $e) {
            report($e);
            return $this->errorResponse('Failed to fetch contact.', 500);
        }
    }

    public function update(ContactRequest $request, Contact $contact): JsonResponse
    {
        try {
            if ($contact->user_id !== auth()->id()) {
                return $this->errorResponse('Contact not found.', 404);
            }

            $contact->update($request->validated());

            return $this->successResponse(
                new ContactResource($contact),
                'Contact updated successfully.'
            );
        } catch (ValidationException $e) {
            return $this->errorResponse('Validation failed.', 422, $e->errors());
        } catch (\Throwable $e) {
            report($e);
            return $this->errorResponse('Failed to update contact.', 500);
        }
    }

    public function destroy(Contact $contact): JsonResponse
    {
        try {
            if ($contact->user_id !== auth()->id()) {
                return $this->errorResponse('Contact not found.', 404);
            }

            $contact->delete();

            return $this->successResponse(null, 'Contact deleted successfully.');
        } catch (\Throwable $e) {
            report($e);
            return $this->errorResponse('Failed to delete contact.', 500);
        }
    }
}
