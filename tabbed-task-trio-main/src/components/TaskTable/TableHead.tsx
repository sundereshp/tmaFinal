import React from 'react';

export function TableHead() {
  return (
    <thead className="bg-muted">
      <tr>
        <th className="px-2 py-1 text-left">Task Name</th>
        <th className="px-2 py-1 text-left">Assignee</th>
        <th className="px-2 py-1 text-left">Due Date</th>
        <th className="px-2 py-1 text-left">Priority</th>
        <th className="px-2 py-1 text-left">Status</th>
        <th className="px-2 py-1 text-left">Est. Time</th>
        <th className="px-2 py-1 text-left">Comments</th>
        <th className="px-2 py-1 text-left">Actions</th>
      </tr>
    </thead>
  );
}
