import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Subtask, User } from "@/types/task";
import { ChevronDown, ChevronRight, Pencil, Plus } from "lucide-react";
import { AssigneeCell } from "./AssigneeCell";
import { CommentsCell } from "./CommentsCell";
import { DueDateCell } from "./DueDateCell";
import { PriorityCell } from "./PriorityCell";
import { RowActions } from "./RowActions";
import { StatusCell } from "./StatusCell";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EstimatedTimeCell } from "./EstimatedTimeCell";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useTaskContext } from "@/context/TaskContext";

interface SubtaskRowProps {
  subtask: Subtask;
  taskId: string;
  users: User[];
  selectedProjectId: string;
  hoveredRowId: string | null;
  setHoveredRowId: (id: string | null) => void;
  editingItem: {
    id: string;
    type: 'task' | 'subtask' | 'actionItem' | 'subactionItem';
    name: string;
  } | null;
  setEditingItem: (item: {
    id: string;
    type: 'task' | 'subtask' | 'actionItem' | 'subactionItem';
    name: string;
  } | null) => void;
  toggleExpanded: (projectId: string, taskId: string, type: "task" | "subtask", subtaskId?: string) => void;
  updateSubtask: (projectId: string, taskId: string, subtaskId: string, updates: Partial<Subtask>) => void;
  handleSaveEdit: () => void;
  handleDeleteItem: (id: string, type: 'task' | 'subtask' | 'actionItem' | 'subactionItem') => void;
  handleAddItem: (type: 'task' | 'subtask' | 'actionItem' | 'subactionItem', parentTaskId?: string, parentSubtaskId?: string) => void;
  handleStartTimer: (taskId: string, subtaskId: string) => void;
}

export function SubtaskRow({
  subtask,
  taskId,
  users,
  selectedProjectId,
  hoveredRowId,
  setHoveredRowId,
  editingItem,
  setEditingItem,
  toggleExpanded,
  updateSubtask,
  handleSaveEdit,
  handleAddItem,
  handleStartTimer
}: SubtaskRowProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { deleteItem } = useTaskContext();
  const handleEditName = () => {
    setEditingItem({
      id: subtask.id,
      type: 'subtask',
      name: subtask.name
    });
  };

  const handleUpdateTime = (estimatedTime: { hours: number; minutes: number } | null) => {
    updateSubtask(selectedProjectId, taskId, subtask.id, { estimatedTime });
  };

  return (
    <tr
      className="border-b border-gray-200 dark:border-gray-700"
      onMouseEnter={() => {
        setHoveredRowId(subtask.id);
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        setHoveredRowId(null);
        setIsHovered(false);
      }}
    >
      <td className="px-2 py-1 overflow-hidden">
        <div className="flex items-center w-full min-w-0 pl-6">
          {/* Chevron Toggle */}
          <div className="flex-shrink-0 flex items-center">
            <button
              className="toggler mr-2"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(selectedProjectId, taskId, 'subtask', subtask.id);
              }}
            >
              {subtask.expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            {/* Status Dropdown as in TaskRow */}
            <div className="flex-shrink-0 mr-2">
              {/* ...DropdownMenu code... */}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            {editingItem && editingItem.id === subtask.id ? (
              <Input
                value={editingItem.name}
                onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                onBlur={handleSaveEdit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveEdit();
                  if (e.key === 'Escape') setEditingItem(null);
                }}
                autoFocus
                className="w-full"
              />
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-between w-full">
                    <span className="truncate">{subtask.name}</span>
                    {!editingItem && hoveredRowId === subtask.id && (
                      <div className="flex-shrink-0 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleEditName}
                          className="h-6 w-6 p-0"
                        >
                          <Pencil size={12} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAddItem('actionItem', taskId, subtask.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Plus size={12} />
                        </Button>
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>{subtask.name}</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </td>

      <td className="px-2 py-1 overflow-hidden" style={{ width: '100px', maxWidth: '100px' }}>
        <div className="truncate">
          <AssigneeCell
            users={users}
            assigneeId={subtask.assignee}
            onChange={(assignee) => updateSubtask(selectedProjectId, taskId, subtask.id, { assignee })}
          />
        </div>
      </td>
      <td className="px-2 py-1 overflow-hidden" style={{ width: '120px', maxWidth: '120px' }}>
        <div className="truncate">
          <DueDateCell
            dueDate={subtask.dueDate}
            onChange={(dueDate) => updateSubtask(selectedProjectId, taskId, subtask.id, { dueDate })}
          />
        </div>
      </td>
      <td className="px-2 py-1 overflow-hidden" style={{ width: '100px', maxWidth: '100px' }}>
        <div className="truncate">
          <PriorityCell
            priority={subtask.priority}
            onChange={(priority) => updateSubtask(selectedProjectId, taskId, subtask.id, { priority })}
          />
        </div>
      </td>
      <td className="px-2 py-1 overflow-hidden" style={{ width: '100px', maxWidth: '100px' }}>
        <div className="truncate">
          <StatusCell
            status={subtask.status}
            onChange={(status) => updateSubtask(selectedProjectId, taskId, subtask.id, { status })}
          />
        </div>
      </td>
      <td className="px-2 py-1 overflow-hidden" style={{ width: '150px', maxWidth: '150px' }}>
        <div className="truncate">
          <EstimatedTimeCell
            estimatedTime={subtask.estimatedTime}
            onChange={handleUpdateTime}
            timeSpent={subtask.timeSpent}
          />
        </div>
      </td>
      <td className="px-2 py-1 overflow-hidden" style={{ width: '100px', maxWidth: '100px' }}>
        <div className="truncate">
          <CommentsCell
            comments={subtask.comments}
            onChange={(comments) => updateSubtask(selectedProjectId, taskId, subtask.id, { comments })}
          />
        </div>
      </td>
      <td className="px-2 py-1 overflow-hidden" style={{ width: '60px', maxWidth: '60px' }}>
        <div className="flex justify-center">
          <RowActions
            onDelete={() => deleteItem(selectedProjectId, subtask.id)}
            onStartTimer={() => handleStartTimer(taskId, subtask.id)}
            showTimer={true}
          />
        </div>
      </td>
    </tr>
  );
}
