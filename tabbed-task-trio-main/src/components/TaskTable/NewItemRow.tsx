
import { Input } from "@/components/ui/input";

interface NewItemRowProps {
  type: 'task' | 'subtask' | 'actionItem' | 'subactionItem';
  name: string;
  setName: (name: string) => void;
  onSave: () => void;
  onCancel: () => void;
  parentTaskId?: string;
  parentSubtaskId?: string;
  parentActionItemId?: string;
}

export function NewItemRow({ 
  type, 
  name, 
  setName, 
  onSave, 
  onCancel,
  parentTaskId,
  parentSubtaskId,
  parentActionItemId
}: NewItemRowProps) {
  let indentation = 0;
  if (type === 'subtask') indentation = 6;
  if (type === 'actionItem') indentation = 12;
  if (type === 'subactionItem') indentation = 16;

  const placeholder = `Enter new ${
    type === 'task' ? 'task' : 
    type === 'subtask' ? 'subtask' : 
    type === 'actionItem' ? 'action item' : 'subaction item'
  } name`;

  return (
    <tr className="task-row">
      <td className="name-cell">
        <div className={`flex items-center${indentation > 0 ? ` pl-${indentation}` : ''}`}>
          <div className="toggler"></div>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => name ? onSave() : onCancel()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && name.trim()) onSave();
              if (e.key === 'Escape') onCancel();
            }}
            placeholder={placeholder}
            autoFocus
            className="inline-edit"
          />
        </div>
      </td>
      <td colSpan={7}></td>
    </tr>
  );
}
