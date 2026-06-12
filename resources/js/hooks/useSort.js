import { useMemo } from 'react';

export default function useSort(config = {}) {
    const { initialField = 'created_at', initialDir = 'desc' } = config;

    const sortConfig = useMemo(() => ({
        field: initialField,
        dir: initialDir,
    }), [initialField, initialDir]);

    const toggleSort = (field) => {
        return {
            sort_field: field,
            sort_dir: sortConfig.field === field && sortConfig.dir === 'desc' ? 'asc' : 'desc',
        };
    };

    const getSortIcon = (field) => {
        if (sortConfig.field !== field) return '↕';
        return sortConfig.dir === 'asc' ? '↑' : '↓';
    };

    return { sortConfig, toggleSort, getSortIcon };
}
