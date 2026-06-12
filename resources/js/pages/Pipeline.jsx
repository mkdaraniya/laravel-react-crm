import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors, useDraggable, useDroppable } from '@dnd-kit/core';
import { getDeals, createDeal, moveDeal } from '../api/deals';
import { apiError } from '../api/client';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { formatCurrency } from '../utils/formatters';

function DealCard({ deal }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `deal-${deal.id}`,
        data: { deal },
    });

    const style = transform
        ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, opacity: isDragging ? 0.4 : 1 }
        : { opacity: isDragging ? 0.4 : 1 };

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes}
            className="bg-white rounded-lg border border-gray-200 p-3 cursor-grab active:cursor-grabbing hover:shadow-sm transition-shadow">
            <p className="text-sm font-medium text-gray-900 mb-1">{deal.name}</p>
            {deal.contact && (
                <p className="text-xs text-gray-500">{deal.contact.first_name} {deal.contact.last_name}{deal.contact.company ? ` - ${deal.contact.company}` : ''}</p>
            )}
            <div className="flex items-center justify-between mt-2">
                <span className="text-sm font-semibold text-indigo-600">${formatCurrency(deal.value)}</span>
                {deal.expected_close_date && <span className="text-xs text-gray-400">Due: {new Date(deal.expected_close_date).toLocaleDateString()}</span>}
            </div>
        </div>
    );
}

function StageColumn({ stage }) {
    const { isOver, setNodeRef } = useDroppable({
        id: `stage-${stage.id}`,
        data: { stageId: stage.id },
    });

    return (
        <div ref={setNodeRef}
            className={`bg-gray-50 rounded-xl border min-w-[280px] w-72 shrink-0 transition-colors ${isOver ? 'border-indigo-400 bg-indigo-50/50' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color || '#6366f1' }} />
                    <h3 className="font-medium text-gray-800 text-sm">{stage.name}</h3>
                </div>
                <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{(stage.deals || []).length}</span>
            </div>
            <div className="p-3 space-y-2 min-h-[120px]">
                {(stage.deals || []).length > 0 ? stage.deals.map((deal) => (
                    <DealCard key={deal.id} deal={deal} />
                )) : (
                    <p className="text-xs text-gray-400 text-center py-6">Drop deals here</p>
                )}
            </div>
        </div>
    );
}

export default function Pipeline() {
    const [stages, setStages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeDeal, setActiveDeal] = useState(null);
    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({ name: '', value: '', pipeline_stage_id: '', expected_close_date: '' });

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    const fetchDeals = useCallback(async () => {
        try {
            const { data } = await getDeals();
            setStages(data.data || []);
        } catch {
            toast.error('Failed to load pipeline.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchDeals(); }, [fetchDeals]);

    const handleDragStart = (event) => {
        const deal = event.active.data.current?.deal;
        if (deal) setActiveDeal(deal);
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        setActiveDeal(null);
        if (!over) return;

        const dealId = active.data.current?.deal?.id;
        const targetStageId = over.data.current?.stageId;
        if (!dealId || !targetStageId) return;

        const currentStage = stages.find((s) => s.deals?.some((d) => d.id === dealId));
        if (currentStage?.id === targetStageId) return;

        try {
            await moveDeal(dealId, targetStageId);
            toast.success('Deal moved.');
            fetchDeals();
        } catch {
            toast.error('Failed to move deal.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            await createDeal(form);
            toast.success('Deal created.');
            setShowCreate(false);
            setForm({ name: '', value: '', pipeline_stage_id: '', expected_close_date: '' });
            fetchDeals();
        } catch (err) {
            toast.error(apiError(err));
        } finally {
            setCreating(false);
        }
    };

    if (loading) return <LoadingSpinner text="Loading pipeline..." />;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-gray-800">Pipeline</h2>
                    <p className="text-sm text-gray-500 mt-0.5">{stages.length} stages</p>
                </div>
                <Button onClick={() => setShowCreate(true)}>+ New Deal</Button>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <div className="flex gap-4 overflow-x-auto pb-4">
                    {stages.map((stage) => (
                        <StageColumn key={stage.id} stage={stage} />
                    ))}
                </div>
                <DragOverlay>
                    {activeDeal && (
                        <div className="bg-white rounded-lg border-2 border-indigo-300 p-3 shadow-lg w-72">
                            <p className="text-sm font-medium text-gray-900">{activeDeal.name}</p>
                            <p className="text-sm font-semibold text-indigo-600 mt-1">${formatCurrency(activeDeal.value)}</p>
                        </div>
                    )}
                </DragOverlay>
            </DndContext>

            <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create New Deal">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Deal Name *</label>
                        <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full rounded-lg border-gray-300 text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Value *</label>
                        <input type="number" step="0.01" min="0" required value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })}
                            className="w-full rounded-lg border-gray-300 text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Stage *</label>
                        <select required value={form.pipeline_stage_id} onChange={(e) => setForm({ ...form, pipeline_stage_id: e.target.value })}
                            className="w-full rounded-lg border-gray-300 text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                            <option value="">Select stage</option>
                            {stages.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Expected Close Date</label>
                        <input type="date" value={form.expected_close_date} onChange={(e) => setForm({ ...form, expected_close_date: e.target.value })}
                            className="w-full rounded-lg border-gray-300 text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div className="flex gap-3 justify-end pt-2">
                        <button type="button" onClick={() => setShowCreate(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
                        <Button type="submit" loading={creating}>Create Deal</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
