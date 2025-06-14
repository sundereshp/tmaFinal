import { useState } from "react";
import { ChevronDown, ChevronRight, Pencil, Plus, Info, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Status, Task, Subtask, TaskType, Priority } from "@/types/task";
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
import { TaskTypeDropdown } from "./TaskTypeDropdown";
import { DescriptionCell } from "./description";

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
  subtaskCount: number;
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
  stopTimer,
  subtaskCount
}: TaskRowProps) {
  const { deleteItem } = useTaskContext();

  const [activeDropdown, setActiveDropdown] = useState<"priority" | "status" | null>(null);

  const [showInfoEditor, setShowInfoEditor] = useState(false);
  const [infoContent, setInfoContent] = useState(task.description || "");
  const [infoDropdownVisible, setInfoDropdownVisible] = useState(false);
  const handleEditName = () => {
    setEditingItem({
      id: task.id,
      type: 'task',
      name: task.name
    });
  };

  const handleTaskTypeChange = (taskType: TaskType) => {
    updateTask(selectedProjectId, task.id, { taskType });
  };

  const handleUpdateTime = (decimalHours: number | null) => {
    if (decimalHours === null) {
      updateTask(selectedProjectId, task.id, { estHours: null });
    } else {
      updateTask(selectedProjectId, task.id, { estHours: decimalHours });
    }
  };

  const handlePriorityChange = (priority: Priority) => {
    updateTask(selectedProjectId, task.id, { priority });
    setActiveDropdown(null); // Close dropdown after selection
  };

  const handleStatusChange = (status: Status) => {
    updateTask(selectedProjectId, task.id, { status });
    setActiveDropdown(null); // Close dropdown after selection
  };

  const handlePriorityClick = () => {
    setActiveDropdown("priority");
  };

  const handleStatusClick = () => {
    setActiveDropdown("status");
  };
  const calculateSubtaskEstimates = (subtasks: Subtask[] = []) => {
    return (subtasks || []).reduce((sum, subtask) => {
      const actionItemsSum = (subtask.actionItems || []).reduce((acc, actionItem) => {
        const subactionSum = (actionItem.subactionItems || []).reduce(
          (s, sub) => s + (sub.estHours || 0), 0
        );
        return acc + (actionItem.estHours || 0) + subactionSum;
      }, 0);
      return sum + (subtask.estHours || 0) + actionItemsSum;
    }, 0);
  };
  return (
    <tr
      className={cn("task-row group border-b border-gray-200 dark:border-gray-700")}
      onMouseEnter={() => setHoveredRowId(task.id)}
      onMouseLeave={() => setHoveredRowId(null)}
    >
      <td className="px-2 py-1 overflow-hidden">
        {/* Chevron, Task Type Dropdown, and Name */}
        <div className="flex items-center w-full">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center w-full min-w-0 gap-2">
                <button
                  className="toggler mr-2"
                  onClick={() => toggleExpanded(selectedProjectId, task.id, 'task')}
                >
                  {task.expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>

                <div className="flex items-center w-full">
                  <div className="flex items-center min-w-0 flex-1">
                    {/* Status Dropdown */}
                    <div className="mr-2">
                      <TaskTypeDropdown
                        taskType={task.taskType || 'task'}
                        status={task.status || 'todo'}
                        onTypeChange={handleTaskTypeChange}
                        onStatusChange={handleStatusChange}
                      />
                    </div>

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
                      <span className="truncate whitespace-nowrap overflow-hidden min-w-0 text-ellipsis">
                        {task.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>{task.name}</TooltipContent>
          </Tooltip>
          {hoveredRowId === task.id && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {task.subtasks?.length > 0 && (
                <span className="flex items-center text-muted-foreground">
                  <Link size={14} className="mr-1" />
                  <span>{task.subtasks.length}</span>
                </span>
              )}
              <DescriptionCell
                description={task.description || ""}
                onChange={(newDescription) => updateTask(selectedProjectId, task.id, { description: newDescription })}
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
                onClick={() => handleAddItem('subtask', task.id)}
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
          {showInfoEditor && (
            <div className="mt-2">
              <Button size="sm" onClick={() => {
                updateTask(selectedProjectId, task.id, { description: infoContent });
                setShowInfoEditor(false);
              }}>
                Save
              </Button>
            </div>
          )}
          {showInfoEditor && (
            <div className="mt-2">
              <Input
                value={infoContent}
                onChange={(e) => setInfoContent(e.target.value)}
                onBlur={() => {
                  updateTask(selectedProjectId, task.id, { description: infoContent });
                  setShowInfoEditor(false);
                }}
                autoFocus
              />
            </div>
          )}
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
            onChange={handlePriorityChange}
            onOpenChange={(open) => {
              if (open) {
                setActiveDropdown("priority");
              } else if (activeDropdown === "priority") {
                setActiveDropdown(null);
              }
            }}
          />
        </div>
      </td>
      <td className="px-2 py-1 overflow-hidden" style={{ width: '100px', maxWidth: '100px' }}>
        <div className="truncate">
          <StatusCell
            status={task.status}
            onChange={handleStatusChange}
            onOpenChange={(open) => {
              if (open) {
                setActiveDropdown("status");
              } else if (activeDropdown === "status") {
                setActiveDropdown(null);
              }
            }}
          />
        </div>
      </td>
      <td className="px-2 py-1 overflow-hidden" style={{ width: '150px', maxWidth: '150px' }}>
        <div className="truncate">
          <EstimatedTimeCell
            estimatedTime={task.estHours || 0}
            onChange={(decimalHours) => {
              if (decimalHours === null) {
                updateTask(selectedProjectId, task.id, { estHours: null });
              } else {
                updateTask(selectedProjectId, task.id, { estHours: decimalHours });
              }
            }}
            totalChildEstimatedTime={calculateSubtaskEstimates(task.subtasks)}
          />
        </div>
      </td>
      <td className="px-2 py-1 overflow-hidden" style={{ width: '100px', maxWidth: '100px' }}>
        <div className="truncate">
          <CommentsCell
            comments={task.comments} // No need to check if array, component handles normalization
            onChange={async (updatedComments) => {
              try {
                await updateTask(selectedProjectId, task.id, {
                  comments: updatedComments // Pass the Comment[] array directly
                });
              } catch (error) {
                console.error('Failed to update comments:', error);
                // Handle error - maybe show a toast
              }
            }}
            userID={1} // Make sure to pass the current user's ID
            disabled={!selectedProjectId}
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
