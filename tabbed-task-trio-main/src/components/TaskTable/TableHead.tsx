
export function TableHead() {
  return (
    <thead className="sticky top-0 bg-muted z-10">
      <tr>
        <th style={{ width: '300px' }}>Name</th>
        <th style={{ width: '100px' }}>Assignee</th>
        <th style={{ width: '120px' }}>Due Date</th>
        <th style={{ width: '100px' }}>Priority</th>
        <th style={{ width: '100px' }}>Status</th>
        <th style={{ width: '100px' }}>Comments</th>
        <th style={{ width: '150px' }}>Est. Time</th>
        <th style={{ width: '60px' }}>Actions</th>
      </tr>
    </thead>
  );
}
