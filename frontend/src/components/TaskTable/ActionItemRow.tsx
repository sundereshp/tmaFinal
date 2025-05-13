import { ActionItem, User, TaskType } from "@/types/task";
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
import { ChevronDown, ChevronRight, Pencil, Plus } from "lucide-react";
import { TaskTypeDropdown } from "./TaskTypeDropdown";
import { useState } from "react";
import { useTaskContext } from "@/context/TaskContext";
import { DescriptionCell } from "./description";

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
  parentTaskType?: TaskType;
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
  stopTimer,
  parentTaskType = 'task'
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

  const handleTaskTypeChange = (type: string) => {
    updateActionItem(selectedProjectId, taskId, subtaskId, actionItem.id, { taskType: type as any });
  };

  const handleStatusChange = (status: string) => {
    updateActionItem(selectedProjectId, taskId, subtaskId, actionItem.id, { status: status as any });
  };

  const isFormsType = parentTaskType === 'forms';

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
            onClick={(e) => {
              e.stopPropagation();
              toggleExpanded(selectedProjectId, taskId, subtaskId, actionItem.id);
            }}
          >
            {actionItem.expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {/* Status Dropdown */}
          <div className="mr-2">
            <TaskTypeDropdown
              taskType={actionItem.taskType || 'task'}
              status={actionItem.status || 'todo'}
              onTypeChange={handleTaskTypeChange}
              onStatusChange={handleStatusChange}
            />
          </div>

          {/* Name and buttons */}
          <div className="flex-1 min-w-0">
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
                className="w-full"
              />
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-between w-full">
                    <span className="truncate flex-grow">
                      {actionItem.name}
                    </span>

                    {!editingItem && hoveredRowId === actionItem.id && (

                      <div className="flex items-center space-x-2">
                        <DescriptionCell
                          description={actionItem.description || ""}
                          onChange={(newDescription) => updateActionItem(selectedProjectId, taskId, subtaskId, actionItem.id, { description: newDescription })}
                        />
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
                          onClick={() => handleAddItem('subactionItem', taskId, subtaskId, actionItem.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Plus size={12} />
                        </Button>
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
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
              actionItem.assignee1ID || 0,
              actionItem.assignee2ID || 0,
              actionItem.assignee3ID || 0
            ]}
            onChange={(assignees) => updateActionItem(selectedProjectId, taskId, subtaskId, actionItem.id, {
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
            dueDate={actionItem.dueDate}
            onChange={(dueDate) => updateActionItem(selectedProjectId, taskId, subtaskId, actionItem.id, { dueDate })}
          />
        </div>
      </td>
      <td className="px-2 py-1 overflow-hidden" style={{ width: '100px', maxWidth: '100px' }}>
        <div className="truncate">
          <PriorityCell
            priority={actionItem.priority}
            onChange={(priority) => updateActionItem(selectedProjectId, taskId, subtaskId, actionItem.id, { priority })}
          />
        </div>
      </td>
      <td className="px-2 py-1 overflow-hidden" style={{ width: '100px', maxWidth: '100px' }}>
        <div className="truncate">
          <StatusCell
            status={actionItem.status}
            onChange={(status) => updateActionItem(selectedProjectId, taskId, subtaskId, actionItem.id, { status })}
          />
        </div>
      </td>

      <td className="px-2 py-1 overflow-hidden" style={{ width: '150px', maxWidth: '150px' }}>
        <div className="truncate">
          <EstimatedTimeCell
            estimatedTime={actionItem.estimatedTime}
            onChange={handleUpdateTime}
            timeSpent={actionItem.timeSpent}
          />
        </div>
      </td>
      <td className="px-2 py-1 overflow-hidden" style={{ width: '100px', maxWidth: '100px' }}>
        <div className="truncate">
          <CommentsCell
            comments={actionItem.comments}
            onChange={(comments) => updateActionItem(selectedProjectId, taskId, subtaskId, actionItem.id, { comments })}
          />
        </div>
      </td>
      <td className="px-2 py-1 overflow-hidden" style={{ width: '60px', maxWidth: '60px' }}>
        <div className="flex justify-center">
          <RowActions
            onDelete={() => deleteItem(selectedProjectId, actionItem.id)}
            onStartTimer={handleTimerToggle}
            isTimerActive={isActiveTimer}
          />
        </div>
      </td>
    </tr>
  );
}
