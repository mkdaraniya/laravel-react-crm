const perPageOptions = [10, 25, 50, 100];

export default function Pagination({ meta, onPageChange, onPerPageChange }) {
    if (!meta || !meta.total) return null;

    const { current_page, last_page, from, to, total, per_page } = meta;
    const pages = [];
    const maxVisible = 5;

    let start = Math.max(1, current_page - Math.floor(maxVisible / 2));
    let end = Math.min(last_page, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);

    for (let i = start; i <= end; i++) pages.push(i);

    return (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 flex-wrap gap-3">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>Show</span>
                    <select value={per_page || 15} onChange={(e) => onPerPageChange?.(Number(e.target.value))}
                        className="rounded-lg border-gray-300 text-sm px-2 py-1">
                        {perPageOptions.map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                    <span>entries</span>
                </div>
                <p className="text-sm text-gray-500">
                    Showing <span className="font-medium">{from}</span> to <span className="font-medium">{to}</span> of{' '}
                    <span className="font-medium">{total}</span>
                </p>
            </div>
            {last_page > 1 && (
                <div className="flex gap-1">
                    <button onClick={() => onPageChange(current_page - 1)} disabled={current_page === 1}
                        className="px-3 py-1.5 text-sm rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">
                        Previous
                    </button>
                    {start > 1 && (
                        <>
                            <button onClick={() => onPageChange(1)} className="px-3 py-1.5 text-sm rounded-md text-gray-600 hover:bg-gray-100">1</button>
                            {start > 2 && <span className="px-2 py-1.5 text-sm text-gray-400">...</span>}
                        </>
                    )}
                    {pages.map((p) => (
                        <button key={p} onClick={() => onPageChange(p)}
                            className={`px-3 py-1.5 text-sm rounded-md ${p === current_page ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                            {p}
                        </button>
                    ))}
                    {end < last_page && (
                        <>
                            {end < last_page - 1 && <span className="px-2 py-1.5 text-sm text-gray-400">...</span>}
                            <button onClick={() => onPageChange(last_page)} className="px-3 py-1.5 text-sm rounded-md text-gray-600 hover:bg-gray-100">{last_page}</button>
                        </>
                    )}
                    <button onClick={() => onPageChange(current_page + 1)} disabled={current_page === last_page}
                        className="px-3 py-1.5 text-sm rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
