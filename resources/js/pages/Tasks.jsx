import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getTasks, createTask, updateTask, toggleTask, deleteTask } from '../api/tasks';
import { getDeals } from '../api/deals';
import { getUsers } from '../api/users';
import { apiError } from '../api/client';
import Modal from '../components/ui/Modal';
import Pagination from '../components/ui/Pagination';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import { STATUS_COLORS, PER_PAGE_OPTIONS } from '../utils/constants';
import { formatDate } from '../utils/formatters';

const emptyForm = {
    title: '', description: '', due_date: '', status: 'pending',
    priority: 'medium', user_id: '', deal_id: '',
};

export default function Tasks() {
    const [tasks, setTasks] = useState({ data: [], meta: {} });
    const [deals, setDeals] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [params, setParams] = useState({
        page: 1, per_page: 10, status: '', user_id: '',
        sort_field: 'created_at', sort_dir: 'desc',
    });

    const fetchData = useCallback(async () => {
        try {
            const [tasksRes, dealsRes, usersRes] = await Promise.all([
                getTasks(params), getDeals(), getUsers(),
            ]);
            setTasks(tasksRes.data);
            const allStages = dealsRes.data.data || [];
            const allDeals = allStages.flatMap((s) => s.deals || []);
            setDeals(allDeals);
            setUsers(usersRes.data.data || []);
        } catch {
            toast.error('Failed to load tasks.');
        } finally {
            setLoading(false);
        }
    }, [params]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const openCreate = () => { setEditId(null); setForm(emptyForm); setShowModal(true); };
    const openEdit = (t) => {
        setEditId(t.id);
        setForm({
            title: t.title, description: t.description || '', due_date: t.due_date ? t.due_date.split('T')[0] : '',
            status: t.status, priority: t.priority, user_id: t.user?.id || '', deal_id: t.deal?.id || '',
        });
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
                await updateTask(editId, getPayload());
                toast.success('Task updated.');
            } else {
                await createTask(getPayload());
                toast.success('Task created.');
            }
            setShowModal(false);
            fetchData();
        } catch (err) {
            toast.error(apiError(err));
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = async (task) => {
        try {
            await toggleTask(task.id);
            toast.success(task.status === 'completed' ? 'Task reopened.' : 'Task completed.');
            fetchData();
        } catch {
            toast.error('Failed to update task.');
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await deleteTask(deleteTarget.id);
            toast.success('Task deleted.');
            setDeleteTarget(null);
            fetchData();
        } catch (err) {
            toast.error(apiError(err));
        } finally {
            setDeleting(false);
        }
    };

    const pendingTasks = tasks.data?.filter((t) => t.status === 'pending') || [];
    const completedTasks = tasks.data?.filter((t) => t.status === 'completed') || [];

    if (loading) return <LoadingSpinner text="Loading tasks..." />;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-gray-800">Tasks</h2>
                    <p className="text-sm text-gray-500 mt-0.5">{tasks.meta?.total || 0} total tasks</p>
                </div>
                <Button onClick={openCreate}>+ New Task</Button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-wrap gap-3 items-center">
                <select value={params.status} onChange={(e) => setParams({ ...params, status: e.target.value, page: 1 })}
                    className="rounded-lg border-gray-300 text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                </select>
                <select value={params.user_id} onChange={(e) => setParams({ ...params, user_id: e.target.value, page: 1 })}
                    className="rounded-lg border-gray-300 text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="">All Users</option>
                    {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
                <select value={params.per_page} onChange={(e) => setParams({ ...params, per_page: Number(e.target.value), page: 1 })}
                    className="rounded-lg border-gray-300 text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                    {PER_PAGE_OPTIONS.map((n) => <option key={n} value={n}>{n} per page</option>)}
                </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200">
                        <div className="px-4 py-3 border-b border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-800">Pending ({pendingTasks.length})</h3>
                        </div>
                        <div className="p-3 space-y-2 max-h-[60vh] overflow-y-auto">
                            {pendingTasks.length > 0 ? pendingTasks.map((task) => (
                                <div key={task.id} className="p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                                    <div className="flex items-start gap-3">
                                        <input type="checkbox" checked={false} onChange={() => handleToggle(task)}
                                            className="mt-0.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900">{task.title}</p>
                                            {task.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{task.description}</p>}
                                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[task.priority] || 'bg-gray-100 text-gray-600'}`}>{task.priority}</span>
                                                {task.user && <span className="text-xs text-gray-400">{task.user.name}</span>}
                                                {task.due_date && <span className="text-xs text-gray-400">Due: {formatDate(task.due_date)}</span>}
                                            </div>
                                            {task.deal && <p className="text-xs text-indigo-600 mt-1">{task.deal.name}</p>}
                                        </div>
                                        <button onClick={() => openEdit(task)} className="text-indigo-600 hover:text-indigo-800 text-xs font-medium shrink-0">Edit</button>
                                        <button onClick={() => setDeleteTarget(task)} className="text-red-600 hover:text-red-800 text-xs font-medium shrink-0">Del</button>
                                    </div>
                                </div>
                            )) : <p className="text-gray-400 text-sm py-6 text-center">No pending tasks</p>}
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200">
                        <div className="px-4 py-3 border-b border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-800">Completed ({completedTasks.length})</h3>
                        </div>
                        <div className="p-3 space-y-2 max-h-[40vh] overflow-y-auto">
                            {completedTasks.length > 0 ? completedTasks.map((task) => (
                                <div key={task.id} className="p-3 rounded-lg border border-gray-100">
                                    <div className="flex items-start gap-3">
                                        <input type="checkbox" checked={true} onChange={() => handleToggle(task)}
                                            className="mt-0.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-400 line-through">{task.title}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-xs text-gray-400">{task.user?.name}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )) : <p className="text-gray-400 text-sm py-6 text-center">No completed tasks</p>}
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4 h-fit">
                    <h3 className="text-sm font-semibold text-gray-800 mb-3">Quick Stats</h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between text-gray-600"><span>Total</span><span className="font-medium">{tasks.meta?.total || 0}</span></div>
                        <div className="flex justify-between text-gray-600"><span>Pending</span><span className="font-medium text-yellow-600">{pendingTasks.length}</span></div>
                        <div className="flex justify-between text-gray-600"><span>Completed</span><span className="font-medium text-green-600">{completedTasks.length}</span></div>
                    </div>
                </div>
            </div>

            <Pagination meta={tasks.meta} onPageChange={(page) => setParams({ ...params, page })} onPerPageChange={(per_page) => setParams({ ...params, per_page, page: 1 })} />

            <Modal open={showModal} onClose={() => setShowModal(false)} title={editId ? 'Edit Task' : 'Create Task'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                        <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                            className="w-full rounded-lg border-gray-300 text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                            className="w-full rounded-lg border-gray-300 text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Assignee *</label>
                            <select required value={form.user_id} onChange={(e) => setForm({ ...form, user_id: e.target.value })}
                                className="w-full rounded-lg border-gray-300 text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                                <option value="">Select user</option>
                                {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
                                className="w-full rounded-lg border-gray-300 text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                            <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                                className="w-full rounded-lg border-gray-300 text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                                className="w-full rounded-lg border-gray-300 text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                                <option value="pending">Pending</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Link to Deal</label>
                            <select value={form.deal_id} onChange={(e) => setForm({ ...form, deal_id: e.target.value })}
                                className="w-full rounded-lg border-gray-300 text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                                <option value="">None</option>
                                {deals.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-3 justify-end pt-2">
                        <button type="button" onClick={() => setShowModal(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
                        <Button type="submit" loading={saving}>{editId ? 'Update' : 'Create'} Task</Button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
                title="Delete Task" message={`Are you sure you want to delete "${deleteTarget?.title}"?`}
                loading={deleting} />
        </div>
    );
}
