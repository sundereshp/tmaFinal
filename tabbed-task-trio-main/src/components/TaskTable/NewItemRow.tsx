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
  newItemState: any;
  selectedProject: any;
  addTask: (projectId: string, name: string) => void;
  addSubtask: (projectId: string, taskId: string, name: string) => void;
  addActionItem: (projectId: string, taskId: string, subtaskId: string, name: string) => void;
  addSubactionItem: (projectId: string, taskId: string, subtaskId: string, actionItemId: string, name: string) => void;
  updateTask: (projectId: string, taskId: string, data: any) => void;
  updateSubtask: (projectId: string, taskId: string, subtaskId: string, data: any) => void;
  updateActionItem: (projectId: string, taskId: string, subtaskId: string, actionItemId: string, data: any) => void;
  setNewItemState: (newItemState: any) => void;
  toast: any;
}

export function NewItemRow({ 
  type, 
  name, 
  setName, 
  onSave, 
  onCancel,
  parentTaskId,
  parentSubtaskId,
  parentActionItemId,
  newItemState,
  selectedProject,
  addTask,
  addSubtask,
  addActionItem,
  addSubactionItem,
  updateTask,
  updateSubtask,
  updateActionItem,
  setNewItemState,
  toast
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

  const handleSaveNewItem = () => {
    if (!newItemState || !selectedProject || !newItemState.name.trim()) return;
    
    const { type, parentTaskId, parentSubtaskId, parentActionItemId, name, fromExpand } = newItemState;
    
    if (type === 'task') {
      addTask(selectedProject.id, name);
    } else if (type === 'subtask' && parentTaskId) {
      addSubtask(selectedProject.id, parentTaskId, name);
      // Ensure the parent task stays expanded after adding subtask
      if (!fromExpand) {
        const task = selectedProject.tasks.find(t => t.id === parentTaskId);
        if (task && !task.expanded) {
          updateTask(selectedProject.id, parentTaskId, { expanded: true });
        }
      }
    } else if (type === 'actionItem' && parentTaskId && parentSubtaskId) {
      addActionItem(selectedProject.id, parentTaskId, parentSubtaskId, name);
      // Ensure the parent subtask stays expanded after adding action item
      if (!fromExpand) {
        const task = selectedProject.tasks.find(t => t.id === parentTaskId);
        if (task) {
          const subtask = task.subtasks.find(s => s.id === parentSubtaskId);
          if (subtask && !subtask.expanded) {
            updateSubtask(selectedProject.id, parentTaskId, parentSubtaskId, { expanded: true });
          }
        }
      }
    } else if (type === 'subactionItem' && parentTaskId && parentSubtaskId && parentActionItemId) {
      addSubactionItem(selectedProject.id, parentTaskId, parentSubtaskId, parentActionItemId, name);
      // Ensure the parent action item stays expanded after adding subaction item
      if (!fromExpand) {
        const task = selectedProject.tasks.find(t => t.id === parentTaskId);
        if (task) {
          const subtask = task.subtasks.find(s => s.id === parentSubtaskId);
          if (subtask) {
            const actionItem = subtask.actionItems.find(a => a.id === parentActionItemId);
            if (actionItem && !actionItem.expanded) {
              updateActionItem(selectedProject.id, parentTaskId, parentSubtaskId, parentActionItemId, { expanded: true });
            }
          }
        }
      }
    }
    
    setNewItemState(null);
    
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} added successfully`);
  };

  return (
    <tr className="task-row">
      <td className="name-cell">
        <div className={`flex items-center${indentation > 0 ? ` pl-${indentation}` : ''}`}>
          <div className="toggler"></div>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => name ? handleSaveNewItem() : onCancel()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && name.trim()) handleSaveNewItem();
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
