import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Subtask, User, TaskType, Status, ActionItem } from "@/types/task";
import { ChevronDown, ChevronRight, Pencil, Plus, Link } from "lucide-react";
import { AssigneeCell } from "./AssigneeCell";
import { CommentsCell } from "./CommentsCell";
import { DueDateCell } from "./DueDateCell";
import { EstimatedTimeCell } from "./EstimatedTimeCell";
import { PriorityCell } from "./PriorityCell";
import { RowActions } from "./RowActions";
import { StatusCell } from "./StatusCell";
import { TaskTypeDropdown } from "./TaskTypeDropdown";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useTaskContext } from "@/context/TaskContext";
import { DescriptionCell } from "./description";

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
  parentTaskType?: TaskType;
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
  handleStartTimer,
  parentTaskType = 'task'
}: SubtaskRowProps) {
  const { deleteItem } = useTaskContext();
  const isFormsType = parentTaskType === 'forms';

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

  const handleTaskTypeChange = (type: TaskType) => {
    updateSubtask(selectedProjectId, taskId, subtask.id, { taskType: type });
  };

  const handleStatusChange = (status: Status) => {
    updateSubtask(selectedProjectId, taskId, subtask.id, { status });
  };
  const calculateActionItemEstimates = (actionItems: ActionItem[]) => {
    return actionItems.reduce((sum, actionItem) => {
      const subactionSum = actionItem.subactionItems.reduce(
        (s, sub) => s + (sub.estHours || 0), 0
      );
      return sum + (actionItem.estHours || 0) + subactionSum;
    }, 0);
  };
  return (
    <tr
      className={cn("task-row group border-b border-gray-200 dark:border-gray-700")}
      onMouseEnter={() => setHoveredRowId(subtask.id)}
      onMouseLeave={() => setHoveredRowId(null)}
    >
      <td className="px-2 py-1 overflow-hidden">
        <div className="flex items-center w-full min-w-0 gap-2 pl-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center w-full min-w-0 gap-2">
                <button 
                  className="toggler mr-2"
                  onClick={() => toggleExpanded(selectedProjectId, taskId, 'subtask', subtask.id)}
                >
                  {subtask.expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>

                <div className="flex items-center w-full">
                  <div className="flex items-center min-w-0 flex-1">
                    {/* Status Dropdown */}
                    <div className="mr-2">
                      <TaskTypeDropdown
                        taskType={subtask.taskType || 'task'}
                        status={subtask.status || 'todo'}
                        onTypeChange={handleTaskTypeChange}
                        onStatusChange={handleStatusChange}
                      />
                    </div>

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
                      <span className="truncate whitespace-nowrap overflow-hidden min-w-0 text-ellipsis">
                        {subtask.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>{subtask.name}</TooltipContent>
          </Tooltip>

          {hoveredRowId === subtask.id && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {subtask.actionItems?.length > 0 && (
                <span className="flex items-center text-muted-foreground">
                  <Link size={14} className="mr-1" />
                  <span>{subtask.actionItems.length}</span>
                </span>
              )}
              <DescriptionCell
                description={subtask.description || ""}
                onChange={(newDescription) => updateSubtask(selectedProjectId, taskId, subtask.id, { description: newDescription })}
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
                onClick={() => handleAddItem('actionItem', taskId, subtask.id)}
                className="h-6 w-6 p-0"
              >
                <Plus size={12} />
              </Button>
            </div>
          )}
        </div>
      </td>

      <td className="px-2 py-1 overflow-hidden" style={{ width: '100px', maxWidth: '100px' }}>
        <div className="truncate">
          <AssigneeCell
            users={users}
            assignees={[
              subtask.assignee1ID || 0,
              subtask.assignee2ID || 0,
              subtask.assignee3ID || 0
            ]}
            onChange={(assignees) => updateSubtask(selectedProjectId, taskId, subtask.id, {
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
            estimatedTime={subtask.estHours || 0}
            onChange={(decimalHours) => {
              if (decimalHours === null) {
                updateSubtask(selectedProjectId, taskId, subtask.id, { estHours: null });
              } else {
                updateSubtask(selectedProjectId, taskId, subtask.id, { estHours: decimalHours });
              }
            }}
            totalChildEstimatedTime={calculateActionItemEstimates(subtask.actionItems)}
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
