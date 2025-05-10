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
      key={subtask.id}
      className="task-row w-full border-separate border-spacing-0"
      onMouseEnter={() => {
        setHoveredRowId(subtask.id);
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        setHoveredRowId(null);
        setIsHovered(false);
      }}
    >
      <td className="name-cell">
        <div className="flex items-center pl-6 w-full overflow-hidden">
          {/* Chevron Toggle */}
          <button
            className="toggler flex-shrink-0 mr-2"
            onClick={() => toggleExpanded(selectedProjectId, taskId, 'subtask', subtask.id)}
          >
            {subtask.expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
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
                    onClick={() => updateSubtask(selectedProjectId, taskId, subtask.id, { status: option.value as any })}
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
                className="inline-edit w-full"
              />
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={cn(
                    "truncate block min-w-0 max-w-full",
                  )}>
                    {subtask.name}
                  </span>
                </TooltipTrigger>
                <TooltipContent>{subtask.name}</TooltipContent>
              </Tooltip>
            )}

            {/* Edit and Add buttons */}
            {!editingItem && hoveredRowId === subtask.id && (
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
                  onClick={() => handleAddItem('actionItem', taskId, subtask.id)}
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
          assigneeId={subtask.assignee}
          onChange={(assignee) => updateSubtask(selectedProjectId, taskId, subtask.id, { assignee })}
        />
      </td>
      <td>
        <DueDateCell
          dueDate={subtask.dueDate}
          onChange={(dueDate) => updateSubtask(selectedProjectId, taskId, subtask.id, { dueDate })}
        />
      </td>
      <td>
        <PriorityCell
          priority={subtask.priority}
          onChange={(priority) => updateSubtask(selectedProjectId, taskId, subtask.id, { priority })}
        />
      </td>
      <td>
        <StatusCell
          status={subtask.status}
          onChange={(status) => updateSubtask(selectedProjectId, taskId, subtask.id, { status })}
        />
      </td>
      <td>
        <CommentsCell
          comments={subtask.comments}
          onChange={(comments) => updateSubtask(selectedProjectId, taskId, subtask.id, { comments })}
        />
      </td>
      <td>
        <EstimatedTimeCell
          estimatedTime={subtask.estimatedTime}
          onChange={handleUpdateTime}
          timeSpent={subtask.timeSpent}
        />
      </td>
      <td>
        <RowActions
          onDelete={() => deleteItem(selectedProjectId, subtask.id)}
          onStartTimer={() => handleStartTimer(taskId, subtask.id)}
          showTimer={true}
        />
      </td>
    </tr>
  );
}
