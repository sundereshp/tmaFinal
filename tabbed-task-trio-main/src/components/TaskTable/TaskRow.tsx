import { useState } from "react";
import { ChevronDown, ChevronRight, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Task } from "@/types/task";
import { cn } from "@/lib/utils";
import { StatusCell } from "./StatusCell";
import { DueDateCell } from "./DueDateCell";
import { PriorityCell } from "./PriorityCell";
import { AssigneeCell } from "./AssigneeCell";
import { CommentsCell } from "./CommentsCell";
import { User } from "@/types/task";
import { RowActions } from "./RowActions";
import { EstimatedTimeCell } from "./EstimatedTimeCell";

interface TaskRowProps {
  task: Task;
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
  updateTask: (projectId: string, taskId: string, updates: Partial<Task>) => void;
  handleSaveEdit: () => void;
  handleDeleteItem: (id: string, type: 'task' | 'subtask' | 'actionItem' | 'subactionItem') => void;
  handleAddItem: (type: 'task' | 'subtask' | 'actionItem' | 'subactionItem', parentTaskId?: string, parentSubtaskId?: string,parentActionItemId?: string) => void;
  startTimer?: (projectId: string, actionItemId: string) => void;
  stopTimer?: () => void;
}

export function TaskRow({
  task,
  users,
  selectedProjectId,
  hoveredRowId,
  setHoveredRowId,
  editingItem,
  setEditingItem,
  toggleExpanded,
  updateTask,
  handleSaveEdit,
  handleDeleteItem,
  handleAddItem,
  startTimer,
  stopTimer
}: TaskRowProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleEditName = () => {
    setEditingItem({ 
      id: task.id, 
      type: 'task', 
      name: task.name 
    });
  };

  const handleUpdateTime = (estimatedTime: { hours: number; minutes: number } | null) => {
    updateTask(selectedProjectId, task.id, { estimatedTime });
  };

  return (
    <tr 
      className="task-row border-b border-gray-200 dark:border-gray-700 px-2"
      onMouseEnter={() => {
        setHoveredRowId(task.id);
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        setHoveredRowId(null);
        setIsHovered(false);
      }}
    >
      <td className="name-cell">
        <div className="flex items-center pl-0 w-full overflow-hidden">
          {/* Chevron Toggle */}
          <button
            className="toggler flex-shrink-0 mr-2"
            onClick={() => toggleExpanded(selectedProjectId, task.id, 'task')}
          >
            {task.expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {/* Dotted Circle SVG */}
          <div className="flex-shrink-0 mr-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-0 bg-transparent border-none hover:scale-105 transition-transform" style={{ width: "16px", height: "16px" }}>
                  <svg viewBox="-3 -3 106 106" style={{ width: "100%", height: "100%" }}>
                    <circle
                      cx="50"
                      cy="50"
                      r="50"
                      fill="transparent"
                      className="stroke-black dark:stroke-white"
                      strokeWidth={5}
                      strokeDasharray={`calc((2 * 3.14 * 45) / 8 - 20), 20`}
                    />
                  </svg>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[120px]">
                {[
                  { value: "todo", label: "To Do", icon: "⏳" },
                  { value: "inprogress", label: "In Progress", icon: "🔄" },
                  { value: "done", label: "Done", icon: "✅" }
                ].map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => updateTask(selectedProjectId, task.id, { status: option.value as any })}
                    className="flex items-center gap-2"
                  >
                    <span className="text-lg">{option.icon}</span>
                    <span>{option.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Name and buttons */}
          <div className="flex items-center justify-between w-full gap-2 min-w-0">
            {/* Truncating name or input */}
            {editingItem && editingItem.id === task.id ? (
              <Input
                value={editingItem.name}
                onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                onBlur={handleSaveEdit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveEdit();
                  if (e.key === 'Escape') setEditingItem(null);
                }}
                autoFocus
                className="inline-edit w-full"
              />
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={cn(
                    "truncate block min-w-0 max-w-full"
                  )}>
                    {task.name}
                  </span>
                </TooltipTrigger>
                <TooltipContent>{task.name}</TooltipContent>
              </Tooltip>
            )}

            {/* Edit and Add buttons */}
            {!editingItem && hoveredRowId === task.id && (
              <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEditName}
                  className="h-6 w-6 p-0 flex-shrink-0"
                >
                  <Pencil size={12} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAddItem('subtask', task.id)}
                  className="h-6 w-6 p-0 flex-shrink-0"
                >
                  <Plus size={12} />
                </Button>
              </div>
            )}
          </div>
        </div>
      </td>
      <td>
        <AssigneeCell
          users={users}
          assigneeId={task.assignee}
          onChange={(assignee) => updateTask(selectedProjectId, task.id, { assignee })}
        />
      </td>
      <td>
        <DueDateCell
          dueDate={task.dueDate}
          onChange={(dueDate) => updateTask(selectedProjectId, task.id, { dueDate })}
        />
      </td>
      <td>
        <PriorityCell
          priority={task.priority}
          onChange={(priority) => updateTask(selectedProjectId, task.id, { priority })}
        />
      </td>
      <td>
        <StatusCell
          status={task.status}
          onChange={(status) => updateTask(selectedProjectId, task.id, { status })}
        />
      </td>
      <td>
        <CommentsCell
          comments={task.comments}
          onChange={(comments) => updateTask(selectedProjectId, task.id, { comments })}
        />
      </td>
      <td>
        <EstimatedTimeCell
          estimatedTime={task.estimatedTime}
          onChange={handleUpdateTime}
          timeSpent={task.timeSpent}
        />
      </td>
      <td>
        <RowActions 
          onDelete={() => handleDeleteItem(task.id, 'task')}
          showTimer={false}
        />
      </td>
    </tr>
  );
}
