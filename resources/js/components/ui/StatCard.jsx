export default function StatCard({ label, value, subtext, color = 'indigo', prefix = '', suffix = '' }) {
    const colorMap = {
        indigo: 'from-indigo-500 to-indigo-600',
        green: 'from-emerald-500 to-emerald-600',
        blue: 'from-blue-500 to-blue-600',
        amber: 'from-amber-500 to-amber-600',
        red: 'from-red-500 to-red-600',
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
                {prefix}{typeof value === 'number' ? value.toLocaleString('en-US', { minimumFractionDigits: value % 1 ? 2 : 0 }) : value}{suffix}
            </p>
            {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
        </div>
    );
}
