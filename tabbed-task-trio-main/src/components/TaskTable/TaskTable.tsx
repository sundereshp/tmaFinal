import { useState } from "react";
import { useTaskContext } from "../../context/TaskContext";
import { ActionItem, Priority, Status, Subtask, SubactionItem, Task } from "@/types/task";
import { toast } from "sonner";
import { TaskTableHeader } from "./TaskTableHeader";
import { TableHead } from "./TableHead";
import { TaskRow } from "./TaskRow";
import { SubtaskRow } from "./SubtaskRow";
import { ActionItemRow } from "./ActionItemRow";
import { SubactionItemRow } from "./SubactionItemRow";
import { NewItemRow } from "./NewItemRow";
import { TimerDialog } from "./TimerDialog";
import { EmptyState } from "./EmptyState";
import React from "react";

export function TaskTable() {
  const {
    selectedProject,
    users,
    addTask,
    updateTask,
    addSubtask,
    updateSubtask,
    addActionItem,
    updateActionItem,
    addSubactionItem,
    updateSubactionItem,
    deleteItem,
    toggleExpanded,
    timer,
    startTimer,
    stopTimer,
    updateItem,
  } = useTaskContext();

  const [editingItem, setEditingItem] = useState<{
    id: string;
    type: 'task' | 'subtask' | 'actionItem' | 'subactionItem';
    name: string;
  } | null>(null);

  const [newItemState, setNewItemState] = useState<{
    type: 'task' | 'subtask' | 'actionItem' | 'subactionItem';
    parentTaskId?: string;
    parentSubtaskId?: string;
    parentActionItemId?: string;
    name: string;
    fromExpand?: boolean;
  } | null>(null);

  const [isTimerDialogOpen, setIsTimerDialogOpen] = useState(false);
  const [timerDialogData, setTimerDialogData] = useState<{
    taskId: string;
    subtaskId: string;
    actionItems: ActionItem[];
    selectedActionItemId: string | null;
  } | null>(null);

  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<number>(15); // Default is 15px

  // Handle toggle expanded behavior
  const handleToggleExpand = (projectId: string, itemId: string, type: 'task' | 'subtask', subtaskId?: string) => {
    if (!selectedProject) return;

    if (type === 'task') {
      const task = selectedProject.tasks.find(t => t.id === itemId);
      if (!task) return;

      if (task.expanded) {
        // If already expanded, collapse
        toggleExpanded(projectId, itemId, type);
      } else {
        // If not expanded, expand
        toggleExpanded(projectId, itemId, type);

        // If no subtasks, show input for creating one, but don't auto-create it
        if (task.subtasks.length === 0) {
          setNewItemState({
            type: 'subtask',
            parentTaskId: task.id,
            name: '',
            fromExpand: true
          });
        }
      }
    } else if (type === 'subtask' && subtaskId) {
      const task = selectedProject.tasks.find(t => t.id === itemId);
      if (!task) return;

      const subtask = task.subtasks.find(s => s.id === subtaskId);
      if (!subtask) return;

      if (subtask.expanded) {
        // If already expanded, collapse
        toggleExpanded(projectId, itemId, type, subtaskId);
      } else {
        // If not expanded, expand
        toggleExpanded(projectId, itemId, type, subtaskId);

        // If no action items, show input for creating one, but don't auto-create it
        if (subtask.actionItems.length === 0) {
          setNewItemState({
            type: 'actionItem',
            parentTaskId: itemId,
            parentSubtaskId: subtaskId,
            name: '',
            fromExpand: true
          });
        }
      }
    }
  };

  // New function to handle toggle expanded for action items
  const handleToggleActionItemExpand = (projectId: string, taskId: string, subtaskId: string, actionItemId: string) => {
    if (!selectedProject) return;

    const task = selectedProject.tasks.find(t => t.id === taskId);
    if (!task) return;

    const subtask = task.subtasks.find(s => s.id === subtaskId);
    if (!subtask) return;

    const actionItem = subtask.actionItems.find(a => a.id === actionItemId);
    if (!actionItem) return;

    if (actionItem.expanded) {
      // If already expanded, collapse
      updateActionItem(projectId, taskId, subtaskId, actionItemId, { expanded: false });
    } else {
      // If not expanded, expand
      updateActionItem(projectId, taskId, subtaskId, actionItemId, { expanded: true });

      // If no subaction items, show input for creating one, but don't auto-create it
      if (actionItem.subactionItems.length === 0) {
        setNewItemState({
          type: 'subactionItem',
          parentTaskId: taskId,
          parentSubtaskId: subtaskId,
          parentActionItemId: actionItemId,
          name: '',
          fromExpand: true
        });
      }
    }
  };

  if (!selectedProject) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please select a project to view tasks</p>
      </div>
    );
  }

  // Ensure tasks is always an array
  const tasks = selectedProject?.tasks || [];

  const handleSaveEdit = async () => {
    try {
      await updateItem(editingItem?.id, { name: editingItem?.name });
      setEditingItem(null);
    } catch (err) {
      console.error('Error saving task name:', err);
    }
  };

  const handleAddItem = (
    type: 'task' | 'subtask' | 'actionItem' | 'subactionItem',
    parentTaskId?: string,
    parentSubtaskId?: string,
    parentActionItemId?: string
  ) => {
    setNewItemState({
      type,
      parentTaskId,
      parentSubtaskId,
      parentActionItemId,
      name: ''
    });
  };

  const handleSaveNewItem = () => {
    if (!newItemState || !selectedProject || !newItemState.name.trim()) return;

    const { type, parentTaskId, parentSubtaskId, parentActionItemId, name, fromExpand } = newItemState;

    if (type === 'task') {
      addTask(selectedProject.id, name);
      if (!fromExpand) {
        const task = selectedProject.tasks.find(t => t.id === parentTaskId);
        if (task && !task.expanded) {
          updateTask(selectedProject.id, parentTaskId, { expanded: true });
        }
      }
    } else if (type === 'subtask' && parentTaskId) {
      addSubtask(selectedProject.id, parentTaskId, name);
      // Ensure the parent task stays expanded after adding subtask
      if (!fromExpand) {
        const task = selectedProject.tasks.find(t => t.id === parentTaskId);
        if (task && !task.expanded) {
          updateTask(selectedProject.id, parentTaskId, { expanded: true });
        }
      }
    } else if (type === 'actionItem' && parentTaskId && parentSubtaskId) {
      addActionItem(selectedProject.id, parentTaskId, parentSubtaskId, name);
      // Ensure the parent subtask stays expanded after adding action item
      if (!fromExpand) {
        const task = selectedProject.tasks.find(t => t.id === parentTaskId);
        if (task) {
          const subtask = task.subtasks.find(s => s.id === parentSubtaskId);
          if (subtask && !subtask.expanded) {
            updateSubtask(selectedProject.id, parentTaskId, parentSubtaskId, { expanded: true });
          }
        }
      }
    } else if (type === 'subactionItem' && parentTaskId && parentSubtaskId && parentActionItemId) {
      addSubactionItem(selectedProject.id, parentTaskId, parentSubtaskId, parentActionItemId, name);
      // Ensure the parent action item stays expanded after adding subaction item
      if (!fromExpand) {
        const task = selectedProject.tasks.find(t => t.id === parentTaskId);
        if (task) {
          const subtask = task.subtasks.find(s => s.id === parentSubtaskId);
          if (subtask) {
            const actionItem = subtask.actionItems.find(a => a.id === parentActionItemId);
            if (actionItem && !actionItem.expanded) {
              updateActionItem(selectedProject.id, parentTaskId, parentSubtaskId, parentActionItemId, { expanded: true });
            }
          }
        }
      }
    }

    setNewItemState(null);

    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} added successfully`);
  };

  const handleDeleteItem = (id: string, type: 'task' | 'subtask' | 'actionItem' | 'subactionItem') => {
    if (!selectedProject) return;

    if (type === 'task') {
      deleteItem(selectedProject.id, id);
      toast.success("Task deleted");
    } else if (type === 'subtask') {
      const parentTask = selectedProject.tasks.find(task =>
        task.subtasks.some(subtask => subtask.id === id)
      );
      if (parentTask) {
        deleteItem(selectedProject.id, parentTask.id);
        toast.success("Subtask deleted");
      }
    } else if (type === 'actionItem') {
      for (const task of selectedProject.tasks) {
        for (const subtask of task.subtasks) {
          if (subtask.actionItems.some(ai => ai.id === id)) {
            deleteItem(selectedProject.id, subtask.id);
            toast.success("Action item deleted");
            return;
          }
        }
      }
    } else if (type === 'subactionItem') {
      for (const task of selectedProject.tasks) {
        for (const subtask of task.subtasks) {
          for (const actionItem of subtask.actionItems) {
            if (actionItem.subactionItems.some(sai => sai.id === id)) {
              deleteItem(selectedProject.id, subtask.id);
              toast.success("Subaction item deleted");
              return;
            }
          }
        }
      }
    }
  };

  const handleStartTimer = (taskId: string, subtaskId: string) => {
    const task = selectedProject.tasks.find(t => t.id === taskId);
    if (!task) return;

    const subtask = task.subtasks.find(s => s.id === subtaskId);
    if (!subtask) return;

    // If there's only one action item, start the timer for that
    if (subtask.actionItems.length === 1) {
      startTimer(selectedProject.id, subtask.actionItems[0].id);
      toast.success("Timer started");
      return;
    }

    // Otherwise open dialog to select action item
    setTimerDialogData({
      taskId,
      subtaskId,
      actionItems: subtask.actionItems,
      selectedActionItemId: null
    });

    setIsTimerDialogOpen(true);
  };

  const confirmStartTimer = () => {
    if (!timerDialogData?.selectedActionItemId || !selectedProject) return;

    startTimer(selectedProject.id, timerDialogData.selectedActionItemId);
    setIsTimerDialogOpen(false);
    toast.success("Timer started");
  };

  const handleStopTimer = () => {
    stopTimer();
    toast.success("Timer stopped");
  };

  const isActiveTimer = (actionItemId: string): boolean => {
    return timer.isRunning && timer.actionItemId === actionItemId;
  };

  const adjustFontSize = (direction: 'increase' | 'decrease') => {
    if (direction === 'increase') {
      setFontSize(prev => Math.min(prev + 1, 20)); // Max size is 20px
    } else {
      setFontSize(prev => Math.max(prev - 1, 10)); // Min size is 10px
    }
  };

  return (
    <div className="w-full overflow-x-auto px-2">
      <TaskTableHeader
        projectName={selectedProject?.name || ""}
        fontSize={fontSize}
        adjustFontSize={adjustFontSize}
        onAddTask={() => handleAddItem('task')}
        timer={timer}
        selectedProjectId={selectedProject?.id || ""}
        onStopTimer={handleStopTimer}
      />
      <div className="bg-background rounded-md shadow overflow-hidden">
        <table className="w-full border-separate border-spacing-0" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '300px' }} />
            <col style={{ width: '100px' }} />
            <col style={{ width: '120px' }} />
            <col style={{ width: '100px' }} />
            <col style={{ width: '100px' }} />
            <col style={{ width: '150px' }} />
            <col style={{ width: '100px' }} />
            <col style={{ width: '60px' }} />
          </colgroup>
          <TableHead />
          <tbody>
            {tasks.length === 0 && !newItemState ? (
              <tr>
                <td colSpan={8} className="px-2 py-1 text-center text-gray-500">
                  No tasks found. Add a new task to get started.
                </td>
              </tr>
            ) : (
              <>
                {newItemState && newItemState.type === 'task' && (
                  <tr>
                    <td colSpan={8}>
                      <NewItemRow
                        type="task"
                        name={newItemState.name}
                        setName={(name) => setNewItemState({ ...newItemState, name })}
                        onSave={handleSaveNewItem}
                        onCancel={() => setNewItemState(null)}
                        newItemState={newItemState}
                        selectedProject={selectedProject}
                        addTask={addTask}
                        addSubtask={addSubtask}
                        addActionItem={addActionItem}
                        addSubactionItem={addSubactionItem}
                        updateTask={updateTask}
                        updateSubtask={updateSubtask}
                        updateActionItem={updateActionItem}
                        setNewItemState={setNewItemState}
                        toast={toast}
                      />
                    </td>
                  </tr>
                )}
                {tasks.map((task) => (
                  <React.Fragment key={`task-${task.id}`}>
                    <TaskRow
                      key={task.id}
                      task={task}
                      users={users}
                      selectedProjectId={selectedProject?.id || ''}
                      hoveredRowId={hoveredRowId}
                      setHoveredRowId={setHoveredRowId}
                      editingItem={editingItem}
                      setEditingItem={setEditingItem}
                      toggleExpanded={handleToggleExpand}
                      updateTask={updateTask}
                      handleSaveEdit={handleSaveEdit}
                      handleAddItem={handleAddItem}
                    />
                    {task.expanded && (
                      <React.Fragment key={`expanded-task-${task.id}`}>
                        {newItemState &&
                          newItemState.type === 'subtask' &&
                          newItemState.parentTaskId === task.id && (
                            <tr key={`new-subtask-${task.id}`}>
                              <td colSpan={8}>
                                <NewItemRow
                                  type="subtask"
                                  name={newItemState.name}
                                  setName={(name) => setNewItemState({ ...newItemState, name })}
                                  onSave={handleSaveNewItem}
                                  onCancel={() => {
                                    setNewItemState(null);
                                    if (newItemState.fromExpand) {
                                      toggleExpanded(selectedProject?.id || '', task.id, 'task');
                                    }
                                  }}
                                  parentTaskId={task.id}
                                  newItemState={newItemState}
                                  selectedProject={selectedProject}
                                  addTask={addTask}
                                  addSubtask={addSubtask}
                                  addActionItem={addActionItem}
                                  addSubactionItem={addSubactionItem}
                                  updateTask={updateTask}
                                  updateSubtask={updateSubtask}
                                  updateActionItem={updateActionItem}
                                  setNewItemState={setNewItemState}
                                  toast={toast}
                                />
                              </td>
                            </tr>
                          )}
                        {task.subtasks?.map((subtask) => (
                          <React.Fragment key={`subtask-${subtask.id}`}>

                            <SubtaskRow
                              subtask={subtask}
                              taskId={task.id}
                              users={users}
                              selectedProjectId={selectedProject?.id || ''}
                              hoveredRowId={hoveredRowId}
                              setHoveredRowId={setHoveredRowId}
                              editingItem={editingItem}
                              setEditingItem={setEditingItem}
                              toggleExpanded={handleToggleExpand}
                              updateSubtask={updateSubtask}
                              handleSaveEdit={handleSaveEdit}
                              handleDeleteItem={handleDeleteItem}
                              handleAddItem={handleAddItem}
                              handleStartTimer={handleStartTimer}
                            />

                            {subtask.expanded && (
                              <React.Fragment key={`expanded-subtask-${subtask.id}`}>
                                {newItemState &&
                                  newItemState.type === 'actionItem' &&
                                  newItemState.parentTaskId === task.id &&
                                  newItemState.parentSubtaskId === subtask.id && (
                                    <tr key={`new-action-item-${subtask.id}`}>
                                      <td colSpan={8}>
                                        <NewItemRow
                                          type="actionItem"
                                          name={newItemState.name}
                                          setName={(name) => setNewItemState({ ...newItemState, name })}
                                          onSave={handleSaveNewItem}
                                          onCancel={() => {
                                            setNewItemState(null);
                                            if (newItemState.fromExpand) {
                                              toggleExpanded(selectedProject?.id || '', task.id, 'subtask', subtask.id);
                                            }
                                          }}
                                          parentTaskId={task.id}
                                          parentSubtaskId={subtask.id}
                                          newItemState={newItemState}
                                          selectedProject={selectedProject}
                                          addTask={addTask}
                                          addSubtask={addSubtask}
                                          addActionItem={addActionItem}
                                          addSubactionItem={addSubactionItem}
                                          updateTask={updateTask}
                                          updateSubtask={updateSubtask}
                                          updateActionItem={updateActionItem}
                                          setNewItemState={setNewItemState}
                                          toast={toast}
                                        />
                                      </td>
                                    </tr>
                                  )}
                                {subtask.actionItems?.map((actionItem) => (
                                  <React.Fragment key={`action-item-${actionItem.id}`}>

                                    <ActionItemRow
                                      actionItem={actionItem}
                                      taskId={task.id}
                                      subtaskId={subtask.id}
                                      isActiveTimer={timer?.actionItemId === actionItem.id}
                                      users={users}
                                      selectedProjectId={selectedProject?.id || ''}
                                      hoveredRowId={hoveredRowId}
                                      setHoveredRowId={setHoveredRowId}
                                      editingItem={editingItem}
                                      setEditingItem={setEditingItem}
                                      toggleExpanded={handleToggleActionItemExpand}
                                      updateActionItem={updateActionItem}
                                      handleSaveEdit={handleSaveEdit}
                                      handleAddItem={handleAddItem}
                                      startTimer={(projectId, actionItemId) => handleStartTimer(projectId, actionItemId)}
                                      stopTimer={handleStopTimer}
                                    />

                                    {actionItem.expanded && (
                                      <React.Fragment key={`expanded-action-item-${actionItem.id}`}>
                                        {newItemState &&
                                          newItemState.type === 'subactionItem' &&
                                          newItemState.parentTaskId === task.id &&
                                          newItemState.parentSubtaskId === subtask.id &&
                                          newItemState.parentActionItemId === actionItem.id && (
                                            <tr key={`new-subaction-item-${actionItem.id}`}>
                                              <td colSpan={8}>
                                                <NewItemRow
                                                  type="subactionItem"
                                                  name={newItemState.name}
                                                  setName={(name) => setNewItemState({ ...newItemState, name })}
                                                  onSave={handleSaveNewItem}
                                                  onCancel={() => {
                                                    setNewItemState(null);
                                                    if (newItemState.fromExpand) {
                                                      toggleExpanded(selectedProject?.id || '', task.id, 'actionItem', actionItem.id);
                                                    }
                                                  }}
                                                  parentTaskId={task.id}
                                                  parentSubtaskId={subtask.id}
                                                  parentActionItemId={actionItem.id}
                                                  newItemState={newItemState}
                                                  selectedProject={selectedProject}
                                                  addTask={addTask}
                                                  addSubtask={addSubtask}
                                                  addActionItem={addActionItem}
                                                  addSubactionItem={addSubactionItem}
                                                  updateTask={updateTask}
                                                  updateSubtask={updateSubtask}
                                                  updateActionItem={updateActionItem}
                                                  setNewItemState={setNewItemState}
                                                  toast={toast}
                                                />
                                              </td>
                                            </tr>
                                          )}
                                        {actionItem.subactionItems?.map((subactionItem) => (
                                          <SubactionItemRow
                                            subactionItem={subactionItem}
                                            taskId={task.id}
                                            subtaskId={subtask.id}
                                            actionItemId={actionItem.id}
                                            isActiveTimer={timer?.subactionItemId === subactionItem.id}
                                            users={users}
                                            selectedProjectId={selectedProject?.id || ''}
                                            hoveredRowId={hoveredRowId}
                                            setHoveredRowId={setHoveredRowId}
                                            editingItem={editingItem}
                                            setEditingItem={setEditingItem}
                                            updateSubactionItem={updateSubactionItem}
                                            handleSaveEdit={handleSaveEdit}
                                            startTimer={(projectId, actionItemId) => handleStartTimer(projectId, actionItemId)}
                                            stopTimer={handleStopTimer}
                                          />
                                        ))}
                                      </React.Fragment>
                                    )}
                                  </React.Fragment>
                                ))}
                              </React.Fragment>
                            )}
                          </React.Fragment>
                        ))}
                      </React.Fragment>
                    )}
                  </React.Fragment>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>
      <TimerDialog
        open={timer?.isActive || false}
        onClose={stopTimer}
        taskId={timer?.taskId || ''}
        subtaskId={timer?.subtaskId || ''}
        actionItemId={timer?.actionItemId || ''}
        subactionItemId={timer?.subactionItemId || ''}
      />
    </div>
  );
}
