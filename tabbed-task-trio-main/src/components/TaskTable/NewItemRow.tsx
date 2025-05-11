import { Input } from "@/components/ui/input";
import { useEffect } from 'react';

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
  addTask: (projectId: string, name: string, status?: any) => void;
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
  console.log('NewItemRow rendered with props:', { 
    type, 
    name, 
    parentTaskId, 
    parentSubtaskId, 
    parentActionItemId,
    hasNewItemState: !!newItemState,
    hasSelectedProject: !!selectedProject
  });

  useEffect(() => {
    console.log('NewItemRow mounted');
    return () => {
      console.log('NewItemRow unmounted');
    };
  }, []);

  useEffect(() => {
    console.log('NewItemRow props updated', { 
      type, 
      name, 
      parentTaskId, 
      parentSubtaskId, 
      parentActionItemId,
      hasNewItemState: !!newItemState,
      hasSelectedProject: !!selectedProject
    });
  }, [type, name, parentTaskId, parentSubtaskId, parentActionItemId, newItemState, selectedProject]);

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
    console.log('handleSaveNewItem called with newItemState:', newItemState);
    
    if (!newItemState) {
      console.error('No newItemState');
      return;
    }
    
    if (!selectedProject) {
      console.error('No project selected');
      return;
    }
    
    if (!newItemState.name?.trim()) {
      console.log('Empty name, not saving');
      return;
    }
    
    const { type, parentTaskId, parentSubtaskId, parentActionItemId, name, fromExpand, status } = newItemState;
    console.log('Processing save for:', { type, name, status });
    
    try {
      if (type === 'task') {
        console.log('Adding task with status:', status || 'todo');
        addTask(selectedProject.id, name, status || 'todo');
      } else if (type === 'subtask' && parentTaskId) {
        console.log('Adding subtask to task:', parentTaskId);
        addSubtask(selectedProject.id, parentTaskId, name);
        if (!fromExpand) {
          const task = selectedProject.tasks.find(t => t.id === parentTaskId);
          if (task && !task.expanded) {
            console.log('Expanding parent task');
            updateTask(selectedProject.id, parentTaskId, { expanded: true });
          }
        }
      } else if (type === 'actionItem' && parentTaskId && parentSubtaskId) {
        console.log('Adding action item to subtask:', parentSubtaskId);
        addActionItem(selectedProject.id, parentTaskId, parentSubtaskId, name);
        if (!fromExpand) {
          const task = selectedProject.tasks.find(t => t.id === parentTaskId);
          if (task) {
            const subtask = task.subtasks.find(s => s.id === parentSubtaskId);
            if (subtask && !subtask.expanded) {
              console.log('Expanding parent subtask');
              updateSubtask(selectedProject.id, parentTaskId, parentSubtaskId, { expanded: true });
            }
          }
        }
      } else if (type === 'subactionItem' && parentTaskId && parentSubtaskId && parentActionItemId) {
        console.log('Adding subaction item to action item:', parentActionItemId);
        addSubactionItem(selectedProject.id, parentTaskId, parentSubtaskId, parentActionItemId, name);
        if (!fromExpand) {
          const task = selectedProject.tasks.find(t => t.id === parentTaskId);
          if (task) {
            const subtask = task.subtasks.find(s => s.id === parentSubtaskId);
            if (subtask) {
              const actionItem = subtask.actionItems.find(a => a.id === parentActionItemId);
              if (actionItem && !actionItem.expanded) {
                console.log('Expanding parent action item');
                updateActionItem(selectedProject.id, parentTaskId, parentSubtaskId, parentActionItemId, { expanded: true });
              }
            }
          }
        }
      }
      
      console.log('Item saved successfully, clearing newItemState');
      setNewItemState(null);
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} added successfully`);
    } catch (error) {
      console.error('Error saving item:', error);
      toast.error(`Failed to add ${type}`);
    }
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
