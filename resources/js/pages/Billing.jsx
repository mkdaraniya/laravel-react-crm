import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getInvoices, createInvoice, updateInvoice, markInvoicePaid, deleteInvoice } from '../api/invoices';
import { apiError } from '../api/client';
import Modal from '../components/ui/Modal';
import Pagination from '../components/ui/Pagination';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import StatCard from '../components/ui/StatCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import { STATUS_COLORS, PER_PAGE_OPTIONS } from '../utils/constants';
import { formatCurrency, formatDate } from '../utils/formatters';

const emptyForm = { contact_id: '', deal_id: '', amount: '', status: 'unpaid', due_date: '' };

export default function Billing() {
    const [data, setData] = useState({ invoices: { data: [], meta: {} }, stats: {} });
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [params, setParams] = useState({
        page: 1, per_page: 10, status: '',
        sort_field: 'created_at', sort_dir: 'desc',
    });
    const [selectedIds, setSelectedIds] = useState(new Set());

    const fetchInvoices = useCallback(async () => {
        try {
            const { data: res } = await getInvoices(params);
            setData({ invoices: { data: res.data, meta: res.meta }, stats: res.stats || {} });
            setSelectedIds(new Set());
        } catch {
            toast.error('Failed to load invoices.');
        } finally {
            setLoading(false);
        }
    }, [params]);

    useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

    const openCreate = () => { setEditId(null); setForm(emptyForm); setShowModal(true); };
    const openEdit = (inv) => {
        setEditId(inv.id);
        setForm({ contact_id: inv.contact_id || '', deal_id: inv.deal_id || '', amount: inv.amount, status: inv.status, due_date: inv.due_date ? inv.due_date.split('T')[0] : '' });
        setShowModal(true);
    };

    const getPayload = () => {
        const p = { ...form };
        Object.keys(p).forEach((k) => { if (p[k] === '') p[k] = null; });
        return p;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editId) {
                await updateInvoice(editId, getPayload());
                toast.success('Invoice updated.');
            } else {
                await createInvoice(getPayload());
                toast.success('Invoice created.');
            }
            setShowModal(false);
            fetchInvoices();
        } catch (err) {
            toast.error(apiError(err));
        } finally {
            setSaving(false);
        }
    };

    const handleMarkPaid = async (id) => {
        try {
            await markInvoicePaid(id);
            toast.success('Invoice marked as paid.');
            fetchInvoices();
        } catch {
            toast.error('Failed to mark invoice as paid.');
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await deleteInvoice(deleteTarget.id);
            toast.success('Invoice deleted.');
            setDeleteTarget(null);
            fetchInvoices();
        } catch (err) {
            toast.error(apiError(err));
        } finally {
            setDeleting(false);
        }
    };

    const handleSort = (field) => {
        setParams((prev) => ({
            ...prev,
            sort_field: field,
            sort_dir: prev.sort_field === field && prev.sort_dir === 'desc' ? 'asc' : 'desc',
            page: 1,
        }));
    };

    const getSortIcon = (field) => {
        if (params.sort_field !== field) return '↕';
        return params.sort_dir === 'asc' ? '↑' : '↓';
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === invoices.data.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(invoices.data.map((inv) => inv.id)));
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    if (loading) return <LoadingSpinner text="Loading billing..." />;

    const { invoices, stats } = data;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-gray-800">Billing</h2>
                    <p className="text-sm text-gray-500 mt-0.5">{invoices.meta?.total || 0} total invoices</p>
                </div>
                <div className="flex items-center gap-3">
                    {selectedIds.size > 0 && (
                        <span className="text-sm text-gray-500">{selectedIds.size} selected</span>
                    )}
                    <Button onClick={openCreate}>+ New Invoice</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <StatCard label="Total Collected" prefix="$" value={stats.total_paid || 0} subtext={`${stats.paid_count || 0} paid invoices`} color="green" />
                <StatCard label="Outstanding" prefix="$" value={stats.total_unpaid || 0} subtext={`${stats.unpaid_count || 0} unpaid invoices`} color="red" />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex flex-wrap gap-3 items-center">
                    <select value={params.status} onChange={(e) => setParams({ ...params, status: e.target.value, page: 1 })}
                        className="rounded-lg border-gray-300 text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                        <option value="">All Status</option>
                        <option value="paid">Paid</option>
                        <option value="unpaid">Unpaid</option>
                        <option value="overdue">Overdue</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <select value={params.per_page} onChange={(e) => setParams({ ...params, per_page: Number(e.target.value), page: 1 })}
                        className="rounded-lg border-gray-300 text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                        {PER_PAGE_OPTIONS.map((n) => <option key={n} value={n}>{n} per page</option>)}
                    </select>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-4 py-3 w-10">
                                    <input type="checkbox" checked={invoices.data.length > 0 && selectedIds.size === invoices.data.length}
                                        onChange={toggleSelectAll}
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                </th>
                                <th className="text-left px-4 py-3 font-medium text-gray-500 cursor-pointer select-none hover:text-gray-700"
                                    onClick={() => handleSort('invoice_number')}>
                                    Invoice <span className="text-gray-400 text-xs">{getSortIcon('invoice_number')}</span>
                                </th>
                                <th className="text-left px-4 py-3 font-medium text-gray-500">Contact</th>
                                <th className="text-left px-4 py-3 font-medium text-gray-500 cursor-pointer select-none hover:text-gray-700"
                                    onClick={() => handleSort('amount')}>
                                    Amount <span className="text-gray-400 text-xs">{getSortIcon('amount')}</span>
                                </th>
                                <th className="text-left px-4 py-3 font-medium text-gray-500 cursor-pointer select-none hover:text-gray-700"
                                    onClick={() => handleSort('status')}>
                                    Status <span className="text-gray-400 text-xs">{getSortIcon('status')}</span>
                                </th>
                                <th className="text-left px-4 py-3 font-medium text-gray-500 cursor-pointer select-none hover:text-gray-700"
                                    onClick={() => handleSort('due_date')}>
                                    Due Date <span className="text-gray-400 text-xs">{getSortIcon('due_date')}</span>
                                </th>
                                <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.data?.length > 0 ? invoices.data.map((inv) => (
                                <tr key={inv.id} className={`border-b border-gray-100 hover:bg-gray-50 ${selectedIds.has(inv.id) ? 'bg-indigo-50/50' : ''}`}>
                                    <td className="px-4 py-3">
                                        <input type="checkbox" checked={selectedIds.has(inv.id)} onChange={() => toggleSelect(inv.id)}
                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                    </td>
                                    <td className="px-4 py-3 font-medium text-gray-900">{inv.invoice_number}</td>
                                    <td className="px-4 py-3 text-gray-500">{inv.contact ? `${inv.contact.first_name} ${inv.contact.last_name}` : '-'}</td>
                                    <td className="px-4 py-3 font-medium text-gray-900">${formatCurrency(inv.amount)}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[inv.status] || 'bg-gray-100 text-gray-600'}`}>{inv.status}</span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">{formatDate(inv.due_date)}</td>
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => openEdit(inv)} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium mr-2">Edit</button>
                                        {inv.status !== 'paid' && (
                                            <button onClick={() => handleMarkPaid(inv.id)} className="text-green-600 hover:text-green-800 text-sm font-medium mr-2">Mark Paid</button>
                                        )}
                                        <button onClick={() => setDeleteTarget(inv)} className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-400">No invoices found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination meta={invoices.meta} onPageChange={(page) => setParams({ ...params, page })} onPerPageChange={(per_page) => setParams({ ...params, per_page, page: 1 })} />
            </div>

            <Modal open={showModal} onClose={() => setShowModal(false)} title={editId ? 'Edit Invoice' : 'Create Invoice'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                        <input type="number" step="0.01" min="0" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                            className="w-full rounded-lg border-gray-300 text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                            className="w-full rounded-lg border-gray-300 text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                            <option value="unpaid">Unpaid</option>
                            <option value="paid">Paid</option>
                            <option value="overdue">Overdue</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                        <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                            className="w-full rounded-lg border-gray-300 text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div className="flex gap-3 justify-end pt-2">
                        <button type="button" onClick={() => setShowModal(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
                        <Button type="submit" loading={saving}>{editId ? 'Update' : 'Create'} Invoice</Button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
                title="Delete Invoice" message={`Delete invoice ${deleteTarget?.invoice_number}? This cannot be undone.`}
                loading={deleting} />
        </div>
    );
}
