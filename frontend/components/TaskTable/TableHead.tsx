import React from 'react';

interface TableHeadProps {
  onSortChange: (status: string, key: string, direction: 'asc' | 'desc' | 'none') => void;
  sortConfig: {
    [status: string]: {
      key: string;
      direction: 'asc' | 'desc' | 'none';
    };
  };
  status: string;
}

export function TableHead({ onSortChange, sortConfig, status }: TableHeadProps) {
  const columns = [
    { label: 'Task Name', accessor: 'name', sortable: true },
    { label: 'Assignee', accessor: 'assignee', sortable: false },
    { label: 'Due Date', accessor: 'dueDate', sortable: true },
    { label: 'Priority', accessor: 'priority', sortable: true },
    { label: 'Status', accessor: 'status', sortable: true },
    { label: 'Est. Time', accessor: 'estimatedTime', sortable: true },
    { label: 'Comments', accessor: 'comments', sortable: false },
    { label: 'Actions', accessor: 'actions', sortable: false },
  ];

  const currentSort = sortConfig[status] || { key: '', direction: 'none' };

  return (
    <thead className="bg-muted">
      <tr className="border-b border-gray-200 dark:border-gray-700">
        {columns.map(({ label, accessor, sortable }) => (
          <th key={accessor} className="px-2 py-2 text-left">
            <div className="flex items-center gap-0.5 w-fit">
              <span>{label}</span>
              {sortable && (
                <select 
                  value={`${currentSort.key === accessor ? currentSort.direction : 'none'}`}
                  onChange={(e) => onSortChange(status, accessor, e.target.value as 'asc' | 'desc' | 'none')}
                  className="ml-1 text-xs bg-transparent border rounded p-0.5 w-8"
                >
                  <option value="none">↕</option>
                  <option value="asc">↓</option>
                  <option value="desc">↑</option>
                </select>
              )}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );
}
