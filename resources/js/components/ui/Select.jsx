export default function Select({ label, error, children, ...props }) {
    return (
        <div>
            {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
            <select {...props}
                className={`w-full rounded-lg border text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${error ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}>
                {children}
            </select>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
}
