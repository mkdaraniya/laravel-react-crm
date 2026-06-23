<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\InvoiceRequest;
use App\Http\Resources\InvoiceResource;
use App\Models\Activity;
use App\Models\Invoice;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class InvoiceController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'status' => 'nullable|string|in:paid,unpaid,overdue,cancelled',
                'sort_field' => 'nullable|string|in:invoice_number,amount,status,due_date,created_at',
                'sort_dir' => 'nullable|string|in:asc,desc',
                'per_page' => 'nullable|integer|min:1|max:100',
            ]);

            $query = Invoice::with(['contact:id,first_name,last_name,company', 'deal:id,name', 'user:id,name'])
                ->where('user_id', auth()->id());

            if ($request->status) {
                $query->where('status', $request->status);
            }

            $sortField = $request->sort_field ?? 'created_at';
            $sortDir = $request->sort_dir === 'asc' ? 'asc' : 'desc';
            $allowedSorts = ['invoice_number', 'amount', 'status', 'due_date', 'created_at'];
            if (!in_array($sortField, $allowedSorts)) {
                $sortField = 'created_at';
            }

            $invoices = $query->orderBy($sortField, $sortDir)->paginate(min((int) ($request->per_page ?? 15), 100));

            $totalPaid = (float) Invoice::where('status', 'paid')->where('user_id', auth()->id())->sum('amount');
            $totalUnpaid = (float) Invoice::whereIn('status', ['unpaid', 'overdue'])->where('user_id', auth()->id())->sum('amount');

            return $this->successResponse(
                InvoiceResource::collection($invoices),
                null,
                200,
                $this->paginationMeta($invoices),
                [
                    'stats' => [
                        'total_paid' => $totalPaid,
                        'total_unpaid' => $totalUnpaid,
                        'paid_count' => Invoice::where('status', 'paid')->where('user_id', auth()->id())->count(),
                        'unpaid_count' => Invoice::whereIn('status', ['unpaid', 'overdue'])->where('user_id', auth()->id())->count(),
                    ],
                ]
            );
        } catch (ValidationException $e) {
            return $this->errorResponse('Validation failed.', 422, $e->errors());
        } catch (\Throwable $e) {
            report($e);
            return $this->errorResponse('Failed to fetch invoices.', 500);
        }
    }

    public function store(InvoiceRequest $request): JsonResponse
    {
        try {
            $invoice = DB::transaction(function () use ($request) {
                $invoice = Invoice::create([
                    ...$request->validated(),
                    'user_id' => auth()->id(),
                    'invoice_number' => 'INV-' . strtoupper(Str::random(8)),
                ]);

                Activity::create([
                    'user_id' => auth()->id(),
                    'deal_id' => $invoice->deal_id,
                    'contact_id' => $invoice->contact_id,
                    'type' => 'invoice_created',
                    'description' => "Invoice {$invoice->invoice_number} created for \$" . number_format($invoice->amount, 2),
                ]);

                return $invoice;
            });

            return $this->successResponse(
                new InvoiceResource($invoice->load(['contact:id,first_name,last_name,company', 'deal:id,name'])),
                'Invoice created successfully.',
                201
            );
        } catch (ValidationException $e) {
            return $this->errorResponse('Validation failed.', 422, $e->errors());
        } catch (\Throwable $e) {
            report($e);
            return $this->errorResponse('Failed to create invoice.', 500);
        }
    }

    public function show(Invoice $invoice): JsonResponse
    {
        try {
            if ($invoice->user_id !== auth()->id()) {
                return $this->errorResponse('Invoice not found.', 404);
            }

            $invoice->load(['contact:id,first_name,last_name,company', 'deal:id,name', 'user:id,name']);

            return $this->successResponse(new InvoiceResource($invoice));
        } catch (\Throwable $e) {
            report($e);
            return $this->errorResponse('Failed to fetch invoice.', 500);
        }
    }

    public function update(InvoiceRequest $request, Invoice $invoice): JsonResponse
    {
        try {
            if ($invoice->user_id !== auth()->id()) {
                return $this->errorResponse('Invoice not found.', 404);
            }

            $oldStatus = $invoice->status;
            $invoice->update($request->validated());

            if ($invoice->status === 'paid' && $oldStatus !== 'paid') {
                $invoice->update(['paid_at' => now()]);
                Activity::create([
                    'user_id' => auth()->id(),
                    'deal_id' => $invoice->deal_id,
                    'contact_id' => $invoice->contact_id,
                    'type' => 'invoice_paid',
                    'description' => "Invoice {$invoice->invoice_number} paid",
                ]);
            }

            return $this->successResponse(
                new InvoiceResource($invoice),
                'Invoice updated successfully.'
            );
        } catch (ValidationException $e) {
            return $this->errorResponse('Validation failed.', 422, $e->errors());
        } catch (\Throwable $e) {
            report($e);
            return $this->errorResponse('Failed to update invoice.', 500);
        }
    }

    public function markPaid(Invoice $invoice): JsonResponse
    {
        try {
            if ($invoice->user_id !== auth()->id()) {
                return $this->errorResponse('Invoice not found.', 404);
            }

            $invoice->update(['status' => 'paid', 'paid_at' => now()]);

            Activity::create([
                'user_id' => auth()->id(),
                'deal_id' => $invoice->deal_id,
                'contact_id' => $invoice->contact_id,
                'type' => 'invoice_paid',
                'description' => "Invoice {$invoice->invoice_number} paid",
            ]);

            return $this->successResponse(
                new InvoiceResource($invoice),
                'Invoice marked as paid.'
            );
        } catch (\Throwable $e) {
            report($e);
            return $this->errorResponse('Failed to mark invoice as paid.', 500);
        }
    }

    public function destroy(Invoice $invoice): JsonResponse
    {
        try {
            if ($invoice->user_id !== auth()->id()) {
                return $this->errorResponse('Invoice not found.', 404);
            }

            $invoice->delete();

            return $this->successResponse(null, 'Invoice deleted successfully.');
        } catch (\Throwable $e) {
            report($e);
            return $this->errorResponse('Failed to delete invoice.', 500);
        }
    }
}
