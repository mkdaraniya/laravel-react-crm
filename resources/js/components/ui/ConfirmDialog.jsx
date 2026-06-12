import { useEffect, useRef } from 'react';

export default function ConfirmDialog({ open, title = 'Confirm', message, children, onConfirm, onCancel, confirmText = 'Delete', loading = false }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" onClick={onCancel}>
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                {children ? children : <p className="text-sm text-gray-600 mb-6">{message}</p>}
                <div className="flex gap-3 justify-end">
                    <button onClick={onCancel} disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50">
                        Cancel
                    </button>
                    <button onClick={onConfirm} disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50">
                        {loading ? 'Deleting...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
