export default function Button({ children, variant = 'primary', loading = false, ...props }) {
    const styles = {
        primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
        secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
        danger: 'bg-red-600 text-white hover:bg-red-700',
        success: 'bg-emerald-600 text-white hover:bg-emerald-700',
    };

    return (
        <button {...props} disabled={loading || props.disabled}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 ${styles[variant] || styles.primary} ${props.className || ''}`}>
            {loading ? 'Processing...' : children}
        </button>
    );
}
