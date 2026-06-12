import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getDashboardStats, getDashboardRevenue, getDashboardActivities } from '../api/dashboard';
import StatCard from '../components/ui/StatCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { formatCurrency } from '../utils/formatters';

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [revenue, setRevenue] = useState([]);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const [statsRes, revenueRes, activitiesRes] = await Promise.all([
                getDashboardStats(), getDashboardRevenue(), getDashboardActivities(),
            ]);
            setStats(statsRes.data.data);
            setRevenue(revenueRes.data.data || []);
            setActivities(activitiesRes.data.data || []);
        } catch {
            toast.error('Failed to load dashboard data.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const res = await getDashboardActivities();
                setActivities(res.data.data || []);
            } catch {}
        }, 15000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return <LoadingSpinner text="Loading dashboard..." />;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>
                <span className="text-xs text-gray-400">Auto-refreshes every 15s</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <StatCard label="Total Revenue" prefix="$" value={formatCurrency(stats?.total_revenue || 0)} subtext="From won deals" color="green" />
                <StatCard label="Active Leads" value={stats?.active_leads || 0} subtext="In pipeline stages" color="blue" />
                <StatCard label="Deal Velocity" value={stats?.deal_velocity || 0} suffix=" days" subtext="Avg time to close" color="amber" />
                <StatCard label="Won Deals" value={stats?.won_deal_count || 0} subtext="Total closed won" color="indigo" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-base font-semibold text-gray-800 mb-4">Revenue Projection</h3>
                    {revenue.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={revenue}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip formatter={(value) => [`$${formatCurrency(value)}`, 'Revenue']} />
                                <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} name="Revenue" />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-gray-400 text-sm py-10 text-center">No revenue data yet</p>
                    )}
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-semibold text-gray-800">Live Activity Feed</h3>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-xs text-gray-400">Live</span>
                        </div>
                    </div>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                        {activities.length > 0 ? activities.slice(0, 20).map((a) => (
                            <div key={a.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-xs font-semibold shrink-0">
                                    {(a.user || 'S').charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-800">{a.description}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{a.created_at}</p>
                                </div>
                            </div>
                        )) : (
                            <p className="text-gray-400 text-sm py-6 text-center">No recent activity</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
