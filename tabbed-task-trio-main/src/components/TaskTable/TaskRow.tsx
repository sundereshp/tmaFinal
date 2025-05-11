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
import { useTaskContext } from "@/context/TaskContext";

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

  handleAddItem: (type: 'task' | 'subtask' | 'actionItem' | 'subactionItem', parentTaskId?: string, parentSubtaskId?: string, parentActionItemId?: string) => void;
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
  handleAddItem,
  startTimer,
  stopTimer
}: TaskRowProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { deleteItem } = useTaskContext();
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
      className="border-b border-gray-200 dark:border-gray-700"
      onMouseEnter={() => {
        setHoveredRowId(task.id);
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        setHoveredRowId(null);
        setIsHovered(false);
      }}
    >
      <td className="px-2 py-1 overflow-hidden">
        <div className="flex items-center w-full min-w-0">
          {/* Chevron Toggle */}
          <div className="flex-shrink-0 flex items-center">
            <button
              className="toggler mr-2"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(selectedProjectId, task.id, 'task');
              }}
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
          </div>

          {/* Name and buttons */}
          <div className="flex-1 min-w-0">
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
                className="w-full"
              />
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-between w-full">
                    <span className="truncate">
                      {task.name}
                    </span>
                    {!editingItem && hoveredRowId === task.id && (
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
                          onClick={() => handleAddItem('subtask', task.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Plus size={12} />
                        </Button>
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>{task.name}</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </td>
      <td className="px-2 py-1 overflow-hidden" style={{ width: '100px', maxWidth: '100px' }}>
        <div className="truncate">
          <AssigneeCell
            users={users}
            assignees={[
              task.assignee1ID || 0,
              task.assignee2ID || 0,
              task.assignee3ID || 0
            ]}
            onChange={(assignees) => updateTask(selectedProjectId, task.id, {
              assignee1ID: assignees[0] || 0,
              assignee2ID: assignees[1] || 0,
              assignee3ID: assignees[2] || 0
            })}
          />
        </div>
      </td>
      <td className="px-2 py-1 overflow-hidden" style={{ width: '120px', maxWidth: '120px' }}>
        <div className="truncate">
          <DueDateCell
            dueDate={task.dueDate}
            onChange={(dueDate) => updateTask(selectedProjectId, task.id, { dueDate })}
          />
        </div>
      </td>
      <td className="px-2 py-1 overflow-hidden" style={{ width: '100px', maxWidth: '100px' }}>
        <div className="truncate">
          <PriorityCell
            priority={task.priority}
            onChange={(priority) => updateTask(selectedProjectId, task.id, { priority })}
          />
        </div>
      </td>
      <td className="px-2 py-1 overflow-hidden" style={{ width: '100px', maxWidth: '100px' }}>
        <div className="truncate">
          <StatusCell
            status={task.status}
            onChange={(status) => updateTask(selectedProjectId, task.id, { status })}
          />
        </div>
      </td>
      <td className="px-2 py-1 overflow-hidden" style={{ width: '150px', maxWidth: '150px' }}>
        <div className="truncate">
          <EstimatedTimeCell
            estimatedTime={task.estimatedTime}
            onChange={handleUpdateTime}
          />
        </div>
      </td>
      <td className="px-2 py-1 overflow-hidden" style={{ width: '100px', maxWidth: '100px' }}>
        <div className="truncate">
          <CommentsCell
            comments={task.description}
            onChange={(description) => updateTask(selectedProjectId, task.id, { description })}
          />
        </div>
      </td>
      <td className="px-2 py-1 overflow-hidden" style={{ width: '60px', maxWidth: '60px' }}>
        <div className="flex justify-center">
          <RowActions
            onDelete={() => deleteItem(selectedProjectId!, task.id)}
          />
        </div>
      </td>
    </tr>
  );
}
