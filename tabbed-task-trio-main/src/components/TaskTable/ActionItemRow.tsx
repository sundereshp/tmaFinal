import { ActionItem, User } from "@/types/task";
import { AssigneeCell } from "./AssigneeCell";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CommentsCell } from "./CommentsCell";
import { DueDateCell } from "./DueDateCell";
import { EstimatedTimeCell } from "./EstimatedTimeCell";
import { PriorityCell } from "./PriorityCell";
import { RowActions } from "./RowActions";
import { StatusCell } from "./StatusCell";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, ChevronRight, Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { useTaskContext } from "@/context/TaskContext";

interface ActionItemRowProps {
  actionItem: ActionItem;
  taskId: string;
  subtaskId: string;
  isActiveTimer: boolean;
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
  toggleExpanded: (projectId: string, taskId: string, subtaskId: string, actionItemId: string) => void;
  updateActionItem: (projectId: string, taskId: string, subtaskId: string, actionItemId: string, updates: Partial<ActionItem>) => void;
  handleSaveEdit: () => void;

  handleAddItem: (type: 'task' | 'subtask' | 'actionItem' | 'subactionItem', parentTaskId?: string, parentSubtaskId?: string, parentActionItemId?: string) => void;
  startTimer: (projectId: string, actionItemId: string) => void;
  stopTimer: () => void;
}

export function ActionItemRow({
  actionItem,
  taskId,
  subtaskId,
  isActiveTimer,
  users,
  selectedProjectId,
  hoveredRowId,
  setHoveredRowId,
  editingItem,
  setEditingItem,
  toggleExpanded,
  updateActionItem,
  handleSaveEdit,
  handleAddItem,
  startTimer,
  stopTimer
}: ActionItemRowProps) {
  const handleUpdateTime = (estimatedTime: { days?: number; hours: number; minutes: number } | null) => {
    updateActionItem(selectedProjectId, taskId, subtaskId, actionItem.id, { estimatedTime });
  };
  const { deleteItem } = useTaskContext();
  const handleTimerToggle = () => {
    if (isActiveTimer) {
      stopTimer();
    } else {
      startTimer(selectedProjectId, actionItem.id);
    }
  };

  const handleEditName = () => {
    setEditingItem({
      id: actionItem.id,
      type: 'actionItem',
      name: actionItem.name
    });
  };

  return (
    <tr
      className={cn("task-row", isActiveTimer ? "bg-primary/5" : "")}
      onMouseEnter={() => setHoveredRowId(actionItem.id)}
      onMouseLeave={() => setHoveredRowId(null)}
    >
      <td className="name-cell">
        <div className="flex items-center pl-12 w-full overflow-hidden">
          {/* Chevron Toggle */}
          <button
            className="toggler flex-shrink-0 mr-2"
            onClick={() => toggleExpanded(selectedProjectId, taskId, subtaskId, actionItem.id)}
          >
            {actionItem.expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
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
                    onClick={() => updateActionItem(selectedProjectId, taskId, subtaskId, actionItem.id, { status: option.value as any })}
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
            {editingItem && editingItem.id === actionItem.id ? (
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
                    isActiveTimer && "font-medium text-primary"
                  )}>
                    {actionItem.name}
                    {isActiveTimer && " (Timer Active)"}
                  </span>
                </TooltipTrigger>
                <TooltipContent>{actionItem.name}</TooltipContent>
              </Tooltip>
            )}

            {/* Edit and Add buttons */}
            {!editingItem && hoveredRowId === actionItem.id && (
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
                  onClick={() => handleAddItem('subactionItem', taskId, subtaskId, actionItem.id)}
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
          assigneeId={actionItem.assignee}
          onChange={(assignee) => updateActionItem(selectedProjectId, taskId, subtaskId, actionItem.id, { assignee })}
        />
      </td>
      <td>
        <DueDateCell
          dueDate={actionItem.dueDate}
          onChange={(dueDate) => updateActionItem(selectedProjectId, taskId, subtaskId, actionItem.id, { dueDate })}
        />
      </td>
      <td>
        <PriorityCell
          priority={actionItem.priority}
          onChange={(priority) => updateActionItem(selectedProjectId, taskId, subtaskId, actionItem.id, { priority })}
        />
      </td>
      <td>
        <StatusCell
          status={actionItem.status}
          onChange={(status) => updateActionItem(selectedProjectId, taskId, subtaskId, actionItem.id, { status })}
        />
      </td>
      <td>
        <CommentsCell
          comments={actionItem.comments}
          onChange={(comments) => updateActionItem(selectedProjectId, taskId, subtaskId, actionItem.id, { comments })}
        />
      </td>
      <td>
        <EstimatedTimeCell
          estimatedTime={actionItem.estimatedTime}
          onChange={handleUpdateTime}
          timeSpent={actionItem.timeSpent}
        />
      </td>
      <td>
        <RowActions
          onDelete={() => deleteItem(selectedProjectId, actionItem.id)}
          onStartTimer={handleTimerToggle}
          isTimerActive={isActiveTimer}
        />
      </td>
    </tr>
  );
}
