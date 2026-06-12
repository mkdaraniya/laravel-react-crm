import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getSettings, updateSettings } from '../api/settings';
import { getUsers, createUser, updateUserRole, deleteUser } from '../api/users';
import { getStages, createStage, updateStage, deleteStage } from '../api/stages';
import { apiError } from '../api/client';
import Modal from '../components/ui/Modal';
import Pagination from '../components/ui/Pagination';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { STATUS_COLORS, PER_PAGE_OPTIONS } from '../utils/constants';
import { formatDate } from '../utils/formatters';

const emptyUserForm = { name: '', email: '', password: '', role: 'user' };
const emptyStageForm = { name: '', color: '#6366f1' };

export default function Settings() {
    const { user: currentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('company');

    const tabs = [
        { key: 'company', label: 'Company Settings' },
        { key: 'stages', label: 'Pipeline Stages' },
        { key: 'users', label: 'User Management' },
    ];

    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Settings</h2>
            <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
                {tabs.map((tab) => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                        {tab.label}
                    </button>
                ))}
            </div>
            {activeTab === 'company' && <CompanySettings />}
            {activeTab === 'stages' && <PipelineStages />}
            {activeTab === 'users' && <UserManagement currentUser={currentUser} />}
        </div>
    );
}

function CompanySettings() {
    const [form, setForm] = useState({ company_name: '', company_email: '', company_phone: '', company_address: '' });
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchSettings = useCallback(async () => {
        try {
            const { data: res } = await getSettings();
            if (res.data) setForm({
                company_name: res.data.company_name || '',
                company_email: res.data.company_email || '',
                company_phone: res.data.company_phone || '',
                company_address: res.data.company_address || '',
            });
        } catch { toast.error('Failed to load settings.'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchSettings(); }, [fetchSettings]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updateSettings(form);
            toast.success('Settings updated.');
        } catch (err) { toast.error(apiError(err)); }
        finally { setSaving(false); }
    };

    if (loading) return <LoadingSpinner text="Loading settings..." />;

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-2xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Company Information</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                    <input type="text" value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                        className="w-full rounded-lg border-gray-300 text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Email</label>
                    <input type="email" value={form.company_email} onChange={(e) => setForm({ ...form, company_email: e.target.value })}
                        className="w-full rounded-lg border-gray-300 text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Phone</label>
                    <input type="text" value={form.company_phone} onChange={(e) => setForm({ ...form, company_phone: e.target.value })}
                        className="w-full rounded-lg border-gray-300 text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Address</label>
                    <textarea value={form.company_address} onChange={(e) => setForm({ ...form, company_address: e.target.value })} rows="3"
                        className="w-full rounded-lg border-gray-300 text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div className="pt-2">
                    <Button type="submit" loading={saving}>Save Settings</Button>
                </div>
            </form>
        </div>
    );
}

function PipelineStages() {
    const [stages, setStages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState(emptyStageForm);
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const fetchStages = useCallback(async () => {
        try {
            const { data: res } = await getStages();
            setStages(res.data || []);
        } catch { toast.error('Failed to load stages.'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchStages(); }, [fetchStages]);

    const openCreate = () => { setEditId(null); setForm(emptyStageForm); setShowModal(true); };
    const openEdit = (stage) => { setEditId(stage.id); setForm({ name: stage.name, color: stage.color || '#6366f1' }); setShowModal(true); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editId) {
                await updateStage(editId, form);
                toast.success('Stage updated.');
            } else {
                await createStage(form);
                toast.success('Stage created.');
            }
            setShowModal(false);
            fetchStages();
        } catch (err) { toast.error(apiError(err)); }
        finally { setSaving(false); }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await deleteStage(deleteTarget.id);
            toast.success('Stage deleted.');
            setDeleteTarget(null);
            fetchStages();
        } catch (err) { toast.error(apiError(err)); }
        finally { setDeleting(false); }
    };

    if (loading) return <LoadingSpinner text="Loading stages..." />;

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden max-w-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Pipeline Stages</h3>
                <Button onClick={openCreate}>+ Add Stage</Button>
            </div>
            <div className="divide-y divide-gray-100">
                {stages.length > 0 ? stages.map((stage) => (
                    <div key={stage.id} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color || '#6366f1' }} />
                            <span className="text-sm font-medium text-gray-700">{stage.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => openEdit(stage)} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Edit</button>
                            <button onClick={() => setDeleteTarget(stage)} className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
                        </div>
                    </div>
                )) : (
                    <div className="px-6 py-8 text-center text-sm text-gray-400">No stages yet. Add your first pipeline stage.</div>
                )}
            </div>

            <Modal open={showModal} onClose={() => setShowModal(false)} title={editId ? 'Edit Stage' : 'Add Stage'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Stage Name *</label>
                        <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full rounded-lg border-gray-300 text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                        <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })}
                            className="w-full h-10 rounded-lg border-gray-300 cursor-pointer" />
                    </div>
                    <div className="flex gap-3 justify-end pt-2">
                        <button type="button" onClick={() => setShowModal(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
                        <Button type="submit" loading={saving}>{editId ? 'Update' : 'Create'} Stage</Button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
                title="Delete Stage" message={`Delete stage "${deleteTarget?.name}"? Deals in this stage will also be removed.`}
                loading={deleting} />
        </div>
    );
}

function UserManagement({ currentUser }) {
    const [users, setUsers] = useState([]);
    const [meta, setMeta] = useState({});
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(emptyUserForm);
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [params, setParams] = useState({
        page: 1, per_page: 10,
        sort_field: 'created_at', sort_dir: 'desc',
    });

    const fetchUsers = useCallback(async () => {
        try {
            const { data: res } = await getUsers(params);
            setUsers(res.data || []);
            setMeta(res.meta || {});
        } catch { toast.error('Failed to load users.'); }
        finally { setLoading(false); }
    }, [params]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await createUser(form);
            toast.success('User created.');
            setShowModal(false);
            setForm(emptyUserForm);
            fetchUsers();
        } catch (err) { toast.error(apiError(err)); }
        finally { setSaving(false); }
    };

    const handleRoleChange = async (userId, role) => {
        try {
            await updateUserRole(userId, role);
            toast.success('User role updated.');
            fetchUsers();
        } catch (err) { toast.error(apiError(err)); }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await deleteUser(deleteTarget.id);
            toast.success('User deleted.');
            setDeleteTarget(null);
            fetchUsers();
        } catch (err) { toast.error(apiError(err)); }
        finally { setDeleting(false); }
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

    if (loading) return <LoadingSpinner text="Loading users..." />;

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">Users</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{meta.total || 0} total users</p>
                </div>
                <Button onClick={() => { setForm(emptyUserForm); setShowModal(true); }}>+ Add User</Button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="text-left px-6 py-3 font-medium text-gray-500 cursor-pointer select-none hover:text-gray-700"
                                onClick={() => handleSort('name')}>
                                Name <span className="text-gray-400 text-xs">{getSortIcon('name')}</span>
                            </th>
                            <th className="text-left px-6 py-3 font-medium text-gray-500 cursor-pointer select-none hover:text-gray-700"
                                onClick={() => handleSort('email')}>
                                Email <span className="text-gray-400 text-xs">{getSortIcon('email')}</span>
                            </th>
                            <th className="text-left px-6 py-3 font-medium text-gray-500 cursor-pointer select-none hover:text-gray-700"
                                onClick={() => handleSort('role')}>
                                Role <span className="text-gray-400 text-xs">{getSortIcon('role')}</span>
                            </th>
                            <th className="text-left px-6 py-3 font-medium text-gray-500 cursor-pointer select-none hover:text-gray-700"
                                onClick={() => handleSort('created_at')}>
                                Joined <span className="text-gray-400 text-xs">{getSortIcon('created_at')}</span>
                            </th>
                            <th className="text-right px-6 py-3 font-medium text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length > 0 ? users.map((u) => (
                            <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="px-6 py-3 font-medium text-gray-900">
                                    {u.name} {u.id === currentUser?.id && <span className="text-xs text-gray-400">(you)</span>}
                                </td>
                                <td className="px-6 py-3 text-gray-500">{u.email}</td>
                                <td className="px-6 py-3">
                                    <select value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                        className={`text-xs font-medium rounded-full px-2 py-0.5 border-none cursor-pointer ${STATUS_COLORS[u.role] || 'bg-gray-100 text-gray-600'}`}>
                                        <option value="user">user</option>
                                        <option value="manager">manager</option>
                                        <option value="admin">admin</option>
                                    </select>
                                </td>
                                <td className="px-6 py-3 text-gray-500 text-xs">{formatDate(u.created_at)}</td>
                                <td className="px-6 py-3 text-right">
                                    {u.id !== currentUser?.id && (
                                        <button onClick={() => setDeleteTarget(u)} className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-400">No users found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            <Pagination meta={meta} onPageChange={(page) => setParams({ ...params, page })} onPerPageChange={(per_page) => setParams({ ...params, per_page, page: 1 })} />

            <Modal open={showModal} onClose={() => setShowModal(false)} title="Create User">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                        <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full rounded-lg border-gray-300 text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="w-full rounded-lg border-gray-300 text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                        <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                            className="w-full rounded-lg border-gray-300 text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                        <select required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                            className="w-full rounded-lg border-gray-300 text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                            <option value="user">User</option>
                            <option value="manager">Manager</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div className="flex gap-3 justify-end pt-2">
                        <button type="button" onClick={() => setShowModal(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
                        <Button type="submit" loading={saving}>Create User</Button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
                title="Delete User" message={`Delete user "${deleteTarget?.name}"? This cannot be undone.`}
                loading={deleting} />
        </div>
    );
}
