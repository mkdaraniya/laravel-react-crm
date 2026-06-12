import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getContacts, createContact, updateContact, deleteContact } from '../api/contacts';
import { apiError } from '../api/client';
import Modal from '../components/ui/Modal';
import Pagination from '../components/ui/Pagination';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import { STATUS_COLORS, PER_PAGE_OPTIONS } from '../utils/constants';
import { formatDate } from '../utils/formatters';

const emptyForm = {
    first_name: '', last_name: '', email: '', phone: '', company: '',
    position: '', status: 'lead', tags: '', source: '', notes: '',
};

export default function Contacts() {
    const [contacts, setContacts] = useState({ data: [], meta: {} });
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [params, setParams] = useState({
        page: 1, per_page: 10, search: '', status: '',
        sort_field: 'created_at', sort_dir: 'desc',
    });
    const [selectedIds, setSelectedIds] = useState(new Set());

    const fetchContacts = useCallback(async () => {
        try {
            const { data } = await getContacts(params);
            setContacts(data);
            setSelectedIds(new Set());
        } catch {
            toast.error('Failed to load contacts.');
        } finally {
            setLoading(false);
        }
    }, [params]);

    useEffect(() => { fetchContacts(); }, [fetchContacts]);

    const openCreate = () => { setEditId(null); setForm(emptyForm); setShowModal(true); };
    const openEdit = (c) => {
        setEditId(c.id);
        setForm({
            first_name: c.first_name, last_name: c.last_name, email: c.email || '', phone: c.phone || '',
            company: c.company || '', position: c.position || '', status: c.status,
            tags: (c.tags || []).join(', '), source: c.source || '', notes: c.notes || '',
        });
        setShowModal(true);
    };

    const getPayload = () => {
        const p = { ...form };
        if (p.tags && typeof p.tags === 'string') p.tags = p.tags.split(',').map((t) => t.trim()).filter(Boolean);
        else delete p.tags;
        Object.keys(p).forEach((k) => { if (p[k] === '') p[k] = null; });
        return p;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editId) {
                await updateContact(editId, getPayload());
                toast.success('Contact updated.');
            } else {
                await createContact(getPayload());
                toast.success('Contact created.');
            }
            setShowModal(false);
            fetchContacts();
        } catch (err) {
            toast.error(apiError(err));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await deleteContact(deleteTarget.id);
            toast.success('Contact deleted.');
            setDeleteTarget(null);
            fetchContacts();
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
        if (selectedIds.size === contacts.data.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(contacts.data.map((c) => c.id)));
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

    if (loading) return <LoadingSpinner text="Loading contacts..." />;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-gray-800">Contacts</h2>
                    <p className="text-sm text-gray-500 mt-0.5">{contacts.meta?.total || 0} total contacts</p>
                </div>
                <div className="flex items-center gap-3">
                    {selectedIds.size > 0 && (
                        <span className="text-sm text-gray-500">{selectedIds.size} selected</span>
                    )}
                    <Button onClick={openCreate}>+ New Contact</Button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex flex-wrap gap-3 items-center">
                    <input type="text" placeholder="Search by name, email, company..." value={params.search}
                        onChange={(e) => setParams({ ...params, search: e.target.value, page: 1 })}
                        className="rounded-lg border-gray-300 text-sm flex-1 min-w-[200px] px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                    <select value={params.status} onChange={(e) => setParams({ ...params, status: e.target.value, page: 1 })}
                        className="rounded-lg border-gray-300 text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                        <option value="">All Status</option>
                        <option value="lead">Lead</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
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
                                    <input type="checkbox" checked={contacts.data.length > 0 && selectedIds.size === contacts.data.length}
                                        onChange={toggleSelectAll}
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                </th>
                                <th className="text-left px-4 py-3 font-medium text-gray-500 cursor-pointer select-none hover:text-gray-700"
                                    onClick={() => handleSort('first_name')}>
                                    Name <span className="text-gray-400 text-xs">{getSortIcon('first_name')}</span>
                                </th>
                                <th className="text-left px-4 py-3 font-medium text-gray-500 cursor-pointer select-none hover:text-gray-700"
                                    onClick={() => handleSort('email')}>
                                    Email <span className="text-gray-400 text-xs">{getSortIcon('email')}</span>
                                </th>
                                <th className="text-left px-4 py-3 font-medium text-gray-500 cursor-pointer select-none hover:text-gray-700"
                                    onClick={() => handleSort('company')}>
                                    Company <span className="text-gray-400 text-xs">{getSortIcon('company')}</span>
                                </th>
                                <th className="text-left px-4 py-3 font-medium text-gray-500 cursor-pointer select-none hover:text-gray-700"
                                    onClick={() => handleSort('status')}>
                                    Status <span className="text-gray-400 text-xs">{getSortIcon('status')}</span>
                                </th>
                                <th className="text-left px-4 py-3 font-medium text-gray-500 cursor-pointer select-none hover:text-gray-700"
                                    onClick={() => handleSort('created_at')}>
                                    Created <span className="text-gray-400 text-xs">{getSortIcon('created_at')}</span>
                                </th>
                                <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contacts.data?.length > 0 ? contacts.data.map((c) => (
                                <tr key={c.id} className={`border-b border-gray-100 hover:bg-gray-50 ${selectedIds.has(c.id) ? 'bg-indigo-50/50' : ''}`}>
                                    <td className="px-4 py-3">
                                        <input type="checkbox" checked={selectedIds.has(c.id)} onChange={() => toggleSelect(c.id)}
                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div>
                                            <p className="font-medium text-gray-900">{c.first_name} {c.last_name}</p>
                                            {c.position && <p className="text-xs text-gray-400">{c.position}</p>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">{c.email || '-'}</td>
                                    <td className="px-4 py-3 text-gray-500">{c.company || '-'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[c.status] || 'bg-gray-100 text-gray-600'}`}>{c.status}</span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(c.created_at)}</td>
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => openEdit(c)} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium mr-3">Edit</button>
                                        <button onClick={() => setDeleteTarget(c)} className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-400">No contacts found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination meta={contacts.meta} onPageChange={(page) => setParams({ ...params, page })} onPerPageChange={(per_page) => setParams({ ...params, per_page, page: 1 })} />
            </div>

            <Modal open={showModal} onClose={() => setShowModal(false)} title={editId ? 'Edit Contact' : 'Create Contact'}>
                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                        <input type="text" required value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                            className="w-full rounded-lg border-gray-300 text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                        <input type="text" required value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                            className="w-full rounded-lg border-gray-300 text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="w-full rounded-lg border-gray-300 text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            className="w-full rounded-lg border-gray-300 text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                        <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })}
                            className="w-full rounded-lg border-gray-300 text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                        <input type="text" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })}
                            className="w-full rounded-lg border-gray-300 text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                            className="w-full rounded-lg border-gray-300 text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                            <option value="lead">Lead</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                        <input type="text" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}
                            className="w-full rounded-lg border-gray-300 text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                        <input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })}
                            className="w-full rounded-lg border-gray-300 text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <textarea rows="3" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                            className="w-full rounded-lg border-gray-300 text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div className="col-span-2 flex gap-3 justify-end pt-2">
                        <button type="button" onClick={() => setShowModal(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
                        <Button type="submit" loading={saving}>{editId ? 'Update' : 'Create'} Contact</Button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
                title="Delete Contact" message={`Are you sure you want to delete "${deleteTarget?.first_name} ${deleteTarget?.last_name}"? This action cannot be undone.`}
                loading={deleting} />
        </div>
    );
}
