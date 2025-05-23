import { SubactionItem, User, TaskType, Status } from "@/types/task";
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
import { TaskTypeDropdown } from "./TaskTypeDropdown";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { useTaskContext } from "../../context/TaskContext";
import { DescriptionCell } from "./description";

interface SubactionItemRowProps {
  subactionItem: SubactionItem;
  taskId: string;
  subtaskId: string;
  actionItemId: string;
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
  updateSubactionItem: (projectId: string, taskId: string, subtaskId: string, actionItemId: string, subactionItemId: string, updates: Partial<SubactionItem>) => void;
  handleSaveEdit: () => void;
  startTimer: (projectId: string, actionItemId: string) => void;
  stopTimer: () => void;
  parentTaskType?: TaskType;
  toggleExpanded: (projectId: string, taskId: string, subtaskId: string, actionItemId: string, subactionItemId: string) => void;
}

export function SubactionItemRow({
  subactionItem,
  taskId,
  subtaskId,
  actionItemId,
  isActiveTimer,
  users,
  selectedProjectId,
  hoveredRowId,
  setHoveredRowId,
  editingItem,
  setEditingItem,
  updateSubactionItem,
  handleSaveEdit,
  startTimer,
  stopTimer,
  parentTaskType = 'task',
  toggleExpanded
}: SubactionItemRowProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { deleteItem } = useTaskContext();
  const isFormsType = parentTaskType === 'forms';
  
  const handleUpdateTime = (estimatedTime: { days?: number; hours: number; minutes: number } | null) => {
    updateSubactionItem(selectedProjectId, taskId, subtaskId, actionItemId, subactionItem.id, { estimatedTime });
  };

  const handleTimerToggle = () => {
    if (isActiveTimer) {
      stopTimer();
    } else {
      startTimer(selectedProjectId, actionItemId);
    }
  };

  const handleEditName = () => {
    setEditingItem({
      id: subactionItem.id,
      type: 'subactionItem',
      name: subactionItem.name
    });
  };

  const handleTaskTypeChange = (type: TaskType) => {
    updateSubactionItem(selectedProjectId, taskId, subtaskId, actionItemId, subactionItem.id, { taskType: type });
  };

  const handleStatusChange = (status: Status) => {
    updateSubactionItem(selectedProjectId, taskId, subtaskId, actionItemId, subactionItem.id, { status });
  };
  
  return (
    <tr
      className={cn("task-row", isActiveTimer ? "bg-primary/5" : "")}
      onMouseEnter={() => setHoveredRowId(subactionItem.id)}
      onMouseLeave={() => setHoveredRowId(null)}
    >
      <td className="name-cell">
        <div className="flex items-center pl-16 w-full overflow-hidden">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center w-full min-w-0 gap-2">
                <div className="flex items-center w-full">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center w-full min-w-0 gap-2">
                        <div className="mr-2">
                          <TaskTypeDropdown
                            taskType={subactionItem.taskType || 'task'}
                            status={subactionItem.status || 'todo'}
                            onTypeChange={handleTaskTypeChange}
                            onStatusChange={handleStatusChange}
                          />
                        </div>

                        <div className="flex items-center min-w-0 flex-1">
                          {editingItem && editingItem.id === subactionItem.id ? (
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
                              {subactionItem.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>{subactionItem.name}</TooltipContent>
                  </Tooltip>

                  {hoveredRowId === subactionItem.id && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <DescriptionCell
                        description={subactionItem.description || ""}
                        onChange={(newDescription) => updateSubactionItem(selectedProjectId, taskId, subtaskId, actionItemId, subactionItem.id, { description: newDescription })}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleEditName}
                        className="h-6 w-6 p-0"
                      >
                        <Pencil size={12} />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </TooltipTrigger>
          </Tooltip>
        </div>
      </td>

      <td className="px-2 py-1 overflow-hidden" style={{ width: '100px', maxWidth: '100px' }}>
        <div className="truncate">
          <AssigneeCell
            users={users}
            assignees={[
              subactionItem.assignee1ID || 0,
              subactionItem.assignee2ID || 0,
              subactionItem.assignee3ID || 0
            ]}
            onChange={(assignees) => updateSubactionItem(selectedProjectId, taskId, subtaskId, actionItemId, subactionItem.id, {
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
            dueDate={subactionItem.dueDate}
            onChange={(dueDate) => updateSubactionItem(selectedProjectId, taskId, subtaskId, actionItemId, subactionItem.id, { dueDate })}
          />
        </div>
      </td>
      <td className="px-2 py-1 overflow-hidden" style={{ width: '100px', maxWidth: '100px' }}>
        <div className="truncate">
          <PriorityCell
            priority={subactionItem.priority}
            onChange={(priority) => updateSubactionItem(selectedProjectId, taskId, subtaskId, actionItemId, subactionItem.id, { priority })}
          />
        </div>
      </td>
      <td className="px-2 py-1 overflow-hidden" style={{ width: '100px', maxWidth: '100px' }}>
        <div className="truncate">
          <StatusCell
            status={subactionItem.status}
            onChange={(status) => updateSubactionItem(selectedProjectId, taskId, subtaskId, actionItemId, subactionItem.id, { status })}
          />
        </div>
      </td>
      <td className="px-2 py-1 overflow-hidden" style={{ width: '150px', maxWidth: '150px' }}>
        <div className="truncate">
          <EstimatedTimeCell
            estimatedTime={subactionItem.estHours || 0}
            onChange={(decimalHours) => {
              if (decimalHours === null) {
                updateSubactionItem(selectedProjectId, taskId, subtaskId, actionItemId, subactionItem.id, { estHours: null });
              } else {
                updateSubactionItem(selectedProjectId, taskId, subtaskId, actionItemId, subactionItem.id, { estHours: decimalHours });
              }
            }}
            totalChildEstimatedTime={0}
          />
        </div>
      </td>
      <td className="px-2 py-1 overflow-hidden" style={{ width: '100px', maxWidth: '100px' }}>
        <div className="truncate">
          <CommentsCell
            comments={subactionItem.comments}
            onChange={(comments) => updateSubactionItem(selectedProjectId, taskId, subtaskId, actionItemId, subactionItem.id, { comments })}
          />
        </div>
      </td>
      
      <td className="px-2 py-1 overflow-hidden" style={{ width: '60px', maxWidth: '60px' }}>
        <div className="flex justify-center">
          <RowActions
            onDelete={() => deleteItem(selectedProjectId, subactionItem.id)}
            onStartTimer={handleTimerToggle}
            isTimerActive={isActiveTimer}
          />
        </div>
      </td>
    </tr>
  );
}
