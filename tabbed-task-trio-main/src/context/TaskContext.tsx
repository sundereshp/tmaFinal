import React, { createContext, useContext, useState, useEffect } from "react";
import { ActionItem, Priority, Project, Status, Subtask, Task, TimerInfo, User, SubactionItem } from "../types/task";
import { addDays } from "date-fns";
import toast from 'react-hot-toast'; // Import toast

// Sample user data
const users: User[] = [
  { id: "1", name: "John Doe" },
  { id: "2", name: "Jane Williams Smith" },
  { id: "3", name: "Mike Johnson" },
  { id: "4", name: "Amy Chen" },
  { id: "5", name: "Bob Wilson" },
  { id: "6", name: "Chris Lee" },
];

interface TaskContextType {
  projects: Project[];
  users: User[];
  timer: TimerInfo;
  selectedProject: Project | null;
  addProject: (name: string) => void;
  updateProject: (projectId: string, name: string) => void;
  deleteProject: (projectId: string) => void;
  renameProject: (projectId: string, name: string) => void;
  duplicateProject: (projectId: string) => void;
  selectProject: (projectId: string | null) => void;
  addTask: (projectId: string, name: string) => void;
  updateTask: (projectId: string, taskId: string, updates: Partial<Task>) => void;
  deleteTask: (projectId: string, taskId: string) => void;
  addSubtask: (projectId: string, taskId: string, name: string) => void;
  updateSubtask: (projectId: string, taskId: string, subtaskId: string, updates: Partial<Subtask>) => void;
  deleteSubtask: (projectId: string, taskId: string, subtaskId: string) => void;
  addActionItem: (projectId: string, taskId: string, subtaskId: string, name: string) => void;
  updateActionItem: (projectId: string, taskId: string, subtaskId: string, actionItemId: string, updates: Partial<ActionItem>) => void;
  deleteActionItem: (projectId: string, taskId: string, subtaskId: string, actionItemId: string) => void;
  addSubactionItem: (projectId: string, taskId: string, subtaskId: string, actionItemId: string, name: string) => void;
  updateSubactionItem: (projectId: string, taskId: string, subtaskId: string, actionItemId: string, subactionItemId: string, updates: Partial<SubactionItem>) => void;
  deleteSubactionItem: (projectId: string, taskId: string, subtaskId: string, actionItemId: string, subactionItemId: string) => void;
  toggleExpanded: (projectId: string, taskId: string, type: "task" | "subtask" | "actionItem", subtaskId?: string, actionItemId?: string) => void;
  startTimer: (projectId: string, actionItemId: string) => void;
  stopTimer: () => void;
  getUserById: (id: string | null) => User | undefined;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [timer, setTimer] = useState<TimerInfo>({
    projectId: null,
    actionItemId: null,
    startTime: null,
    isRunning: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/projects');
        if (!response.ok) throw new Error('Failed to fetch projects');
        const fetchedProjects = await response.json();
        setProjects(fetchedProjects);
        
        // If no projects exist, create a default one
        if (fetchedProjects.length === 0) {
          await addProject('Default Project');
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to fetch projects');
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const fetchTasks = async (projectId: string) => {
    try {
      const parsedProjectId = parseInt(projectId);
      if (isNaN(parsedProjectId)) {
        throw new Error('Invalid project ID');
      }

      const response = await fetch(`http://localhost:5000/api/tasks/project/${parsedProjectId}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch tasks');
      }

      const tasks = await response.json();
      
      // Update the local state with the fetched tasks
      setProjects(projects.map(project => {
        if (project.id === projectId) {
          return {
            ...project,
            tasks: tasks.map(task => ({
              id: task.id.toString(),
              name: task.name,
              assignee: null,
              dueDate: null,
              priority: "normal" as Priority,
              status: task.statusDisplay as Status,
              comments: "",
              estimatedTime: null,
              timeSpent: 0,
              expanded: true,
              subtasks: []
            }))
          };
        }
        return project;
      }));
    } catch (err) {
      console.error('Error fetching tasks:', err);
      throw err;
    }
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/projects');
        if (!response.ok) throw new Error('Failed to fetch projects');
        
        const projects = await response.json();
        setProjects(projects);
        
        // If there's a selected project, fetch its tasks
        if (selectedProjectId) {
          fetchTasks(selectedProjectId);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        setError('Failed to load projects');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [selectedProjectId]);
  
  const selectedProject = projects.find(p => p.id === selectedProjectId) || null;

  const addProject = async (name: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userID: 1,
          name,
          startDate: new Date().toISOString(),
          endDate: addDays(new Date(), 30).toISOString(),
          wsID: 1
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create project');
      }

      const createdProject = await response.json();
      setProjects(prev => [...prev, createdProject]);
      
      // Select the newly created project
      setSelectedProjectId(createdProject.id);
      
      return createdProject;
    } catch (err) {
      console.error('Error adding project:', err);
      throw err;
    }
  };

  const updateProject = (projectId: string, name: string) => {
    setProjects(projects.map(project =>
      project.id === projectId ? { ...project, name } : project
    ));
  };

  const renameProject = async (projectId: string, name: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
  
      if (!response.ok) throw new Error('Failed to rename project');
  
      const updatedProject = await response.json();
      setProjects(prev =>
        prev.map(project => project.id === updatedProject.id ? updatedProject : project)
      );
    } catch (err) {
      console.error('Error renaming project:', err);
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete project');

      setProjects(prev => prev.filter(project => project.id !== projectId));

      if (selectedProjectId === projectId) {
        setSelectedProjectId(projects.length > 1 ? projects[0].id : null);
      }
    } catch (err) {
      console.error('Error deleting project:', err);
    }
  };

  const duplicateProject = (projectId: string) => {
    const sourceProject = projects.find(p => p.id === projectId);
    if (!sourceProject) return;

    // Generate incremented name by checking existing copies
    const baseName = sourceProject.name.replace(/\(\d+\)$/, '').trim();
    const regex = new RegExp(`^${baseName}(?:\s*\((\d+)\))?$`);

    // Find the highest number suffix
    let highestNumber = 0;
    projects.forEach(project => {
      const match = project.name.match(regex);
      if (match && match[1]) {
        const num = parseInt(match[1], 10);
        if (num > highestNumber) {
          highestNumber = num;
        }
      } else if (match && project.name === baseName) {
        // If there's an exact match (no number), count it as (1)
        highestNumber = Math.max(highestNumber, 1);
      }
    });

    // Create a deep copy of the project
    const deepCopy = JSON.parse(JSON.stringify(sourceProject));

    // Create the new project with incremented name and new ID
    const newProject: Project = {
      ...deepCopy,
      id: `p${Date.now()}`,
      name: highestNumber > 0 
        ? `${baseName} (${highestNumber + 1})`
        : `${baseName} (1)`
    };

    setProjects([...projects, newProject]);
  };

  const selectProject = (projectId: string | null) => {
    setSelectedProjectId(projectId);
  };

  const addTask = async (projectId: string, name: string) => {
    const newTaskPayload = {
      name,
      wsID: 1,
      userID: 1,
      projectID: parseInt(projectId),
      taskLevel: 1,
      status: 'TODO',
      parentID: 0,
      level1ID: 0,
      level2ID: 0,
      level3ID: 0,
      level4ID: 0,
      assignee1ID: 0,
      assignee2ID: 0,
      assignee3ID: 0,
      estHours: 0,
      estPrevHours: [],
      actHours: 0,
      isExeceeded: 0,
      info: {},
      description: '',
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString()
    };

    try {
      const response = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTaskPayload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create task');
      }

      const createdTask = await response.json();
      
      // Update the local state with the new task
      setProjects(prevProjects => {
        return prevProjects.map(project => {
          if (project.id === projectId) {
            return {
              ...project,
              tasks: [
                ...project.tasks,
                {
                  id: createdTask.id.toString(),
                  name: createdTask.name,
                  assignee: null,
                  dueDate: null,
                  priority: "normal" as Priority,
                  status: "todo" as Status,
                  comments: "",
                  estimatedTime: null,
                  timeSpent: 0,
                  expanded: true,
                  subtasks: []
                }
              ]
            };
          }
          return project;
        });
      });

      toast.success('Task created successfully');
      return createdTask;
    } catch (err) {
      console.error('Error adding task:', err);
      toast.error('Failed to create task');
      throw err;
    }
  };

  const updateTask = async (projectId: string, taskId: string, updates: Partial<Task>) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) throw new Error('Failed to update task');

      const updatedTask = await response.json();
      
      // Update the local state with the updated task
      setProjects(projects.map(project => {
        if (project.id === projectId) {
          return {
            ...project,
            tasks: project.tasks.map(task =>
              task.id === taskId ? { ...task, ...updates } : task
            )
          };
        }
        return project;
      }));
    } catch (err) {
      console.error('Error updating task:', err);
      throw err;
    }
  };

  const deleteTask = async (projectId: string, taskId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) throw new Error('Failed to delete task');
  
      setProjects(projects.map(project => {
        if (project.id === projectId) {
          return {
            ...project,
            tasks: project.tasks.filter(task => task.id !== taskId)
          };
        }
        return project;
      }));
    } catch (err) {
      console.error('Error deleting task:', err);
      throw err;
    }
  };
  
  

  const addSubtask = (projectId: string, taskId: string, name: string) => {
    setProjects(projects.map(project => {
      if (project.id === projectId) {
        return {
          ...project,
          tasks: project.tasks.map(task => {
            if (task.id === taskId) {
              return {
                ...task,
                subtasks: [
                  ...task.subtasks,
                  {
                    id: `st${Date.now()}`,
                    name,
                    assignee: null,
                    dueDate: null,
                    priority: "normal" as Priority,
                    status: "todo" as Status,
                    comments: "",
                    estimatedTime: null,
                    timeSpent: 0,
                    expanded: true,
                    actionItems: []
                  }
                ]
              };
            }
            return task;
          })
        };
      }
      return project;
    }));
  };

  const updateSubtask = (projectId: string, taskId: string, subtaskId: string, updates: Partial<Subtask>) => {
    setProjects(projects.map(project => {
      if (project.id === projectId) {
        return {
          ...project,
          tasks: project.tasks.map(task => {
            if (task.id === taskId) {
              return {
                ...task,
                subtasks: task.subtasks.map(subtask =>
                  subtask.id === subtaskId ? { ...subtask, ...updates } : subtask
                )
              };
            }
            return task;
          })
        };
      }
      return project;
    }));
  };

  const deleteSubtask = (projectId: string, taskId: string, subtaskId: string) => {
    setProjects(projects.map(project => {
      if (project.id === projectId) {
        return {
          ...project,
          tasks: project.tasks.map(task => {
            if (task.id === taskId) {
              return {
                ...task,
                subtasks: task.subtasks.filter(subtask => subtask.id !== subtaskId)
              };
            }
            return task;
          })
        };
      }
      return project;
    }));
  };

  const addActionItem = (projectId: string, taskId: string, subtaskId: string, name: string) => {
    setProjects(projects.map(project => {
      if (project.id === projectId) {
        return {
          ...project,
          tasks: project.tasks.map(task => {
            if (task.id === taskId) {
              return {
                ...task,
                subtasks: task.subtasks.map(subtask => {
                  if (subtask.id === subtaskId) {
                    return {
                      ...subtask,
                      actionItems: [
                        ...subtask.actionItems,
                        {
                          id: `a${Date.now()}`,
                          name,
                          assignee: null,
                          dueDate: null,
                          priority: "normal" as Priority,
                          status: "todo" as Status,
                          comments: "",
                          estimatedTime: null,
                          timeSpent: 0,
                          expanded: false,
                          subactionItems: []
                        }
                      ]
                    };
                  }
                  return subtask;
                })
              };
            }
            return task;
          })
        };
      }
      return project;
    }));
  };

  const updateActionItem = (
    projectId: string,
    taskId: string,
    subtaskId: string,
    actionItemId: string,
    updates: Partial<ActionItem>
  ) => {
    setProjects(projects.map(project => {
      if (project.id === projectId) {
        return {
          ...project,
          tasks: project.tasks.map(task => {
            if (task.id === taskId) {
              return {
                ...task,
                subtasks: task.subtasks.map(subtask => {
                  if (subtask.id === subtaskId) {
                    return {
                      ...subtask,
                      actionItems: subtask.actionItems.map(actionItem =>
                        actionItem.id === actionItemId ? { ...actionItem, ...updates } : actionItem
                      )
                    };
                  }
                  return subtask;
                })
              };
            }
            return task;
          })
        };
      }
      return project;
    }));
  };

  const deleteActionItem = (projectId: string, taskId: string, subtaskId: string, actionItemId: string) => {
    setProjects(projects.map(project => {
      if (project.id === projectId) {
        return {
          ...project,
          tasks: project.tasks.map(task => {
            if (task.id === taskId) {
              return {
                ...task,
                subtasks: task.subtasks.map(subtask => {
                  if (subtask.id === subtaskId) {
                    return {
                      ...subtask,
                      actionItems: subtask.actionItems.filter(actionItem => actionItem.id !== actionItemId)
                    };
                  }
                  return subtask;
                })
              };
            }
            return task;
          })
        };
      }
      return project;
    }));
  };

  const addSubactionItem = (projectId: string, taskId: string, subtaskId: string, actionItemId: string, name: string) => {
    setProjects(projects.map(project => {
      if (project.id === projectId) {
        return {
          ...project,
          tasks: project.tasks.map(task => {
            if (task.id === taskId) {
              return {
                ...task,
                subtasks: task.subtasks.map(subtask => {
                  if (subtask.id === subtaskId) {
                    return {
                      ...subtask,
                      actionItems: subtask.actionItems.map(actionItem => {
                        if (actionItem.id === actionItemId) {
                          return {
                            ...actionItem,
                            subactionItems: [
                              ...actionItem.subactionItems,
                              {
                                id: `sa${Date.now()}`,
                                name,
                                assignee: null,
                                dueDate: null,
                                priority: "normal" as Priority,
                                status: "todo" as Status,
                                comments: "",
                                estimatedTime: null,
                                timeSpent: 0
                              }
                            ]
                          };
                        }
                        return actionItem;
                      })
                    };
                  }
                  return subtask;
                })
              };
            }
            return task;
          })
        };
      }
      return project;
    }));
  };

  const updateSubactionItem = (
    projectId: string,
    taskId: string,
    subtaskId: string,
    actionItemId: string,
    subactionItemId: string,
    updates: Partial<SubactionItem>
  ) => {
    setProjects(projects.map(project => {
      if (project.id === projectId) {
        return {
          ...project,
          tasks: project.tasks.map(task => {
            if (task.id === taskId) {
              return {
                ...task,
                subtasks: task.subtasks.map(subtask => {
                  if (subtask.id === subtaskId) {
                    return {
                      ...subtask,
                      actionItems: subtask.actionItems.map(actionItem => {
                        if (actionItem.id === actionItemId) {
                          return {
                            ...actionItem,
                            subactionItems: actionItem.subactionItems.map(subactionItem =>
                              subactionItem.id === subactionItemId ? { ...subactionItem, ...updates } : subactionItem
                            )
                          };
                        }
                        return actionItem;
                      })
                    };
                  }
                  return subtask;
                })
              };
            }
            return task;
          })
        };
      }
      return project;
    }));
  };

  const deleteSubactionItem = (
    projectId: string,
    taskId: string,
    subtaskId: string,
    actionItemId: string,
    subactionItemId: string
  ) => {
    setProjects(projects.map(project => {
      if (project.id === projectId) {
        return {
          ...project,
          tasks: project.tasks.map(task => {
            if (task.id === taskId) {
              return {
                ...task,
                subtasks: task.subtasks.map(subtask => {
                  if (subtask.id === subtaskId) {
                    return {
                      ...subtask,
                      actionItems: subtask.actionItems.map(actionItem => {
                        if (actionItem.id === actionItemId) {
                          return {
                            ...actionItem,
                            subactionItems: actionItem.subactionItems.filter(
                              subactionItem => subactionItem.id !== subactionItemId
                            )
                          };
                        }
                        return actionItem;
                      })
                    };
                  }
                  return subtask;
                })
              };
            }
            return task;
          })
        };
      }
      return project;
    }));
  };

  const toggleExpanded = (projectId: string, taskId: string, type: "task" | "subtask" | "actionItem", subtaskId?: string, actionItemId?: string) => {
    setProjects(projects.map(project => {
      if (project.id === projectId) {
        return {
          ...project,
          tasks: project.tasks.map(task => {
            if (task.id === taskId) {
              if (type === "task") {
                // If task has no subtasks, we don't toggle but keep it expanded
                // This allows the UI to handle showing the input field
                if (task.subtasks.length === 0) {
                  return {
                    ...task,
                    expanded: true
                  };
                }
                // Otherwise, toggle as normal
                return {
                  ...task,
                  expanded: !task.expanded
                };
              } else if (type === "subtask" && subtaskId) {
                return {
                  ...task,
                  subtasks: task.subtasks.map(subtask => {
                    if (subtask.id === subtaskId) {
                      // If subtask has no action items, keep it expanded
                      if (subtask.actionItems.length === 0) {
                        return { ...subtask, expanded: true };
                      }
                      // Otherwise toggle as normal
                      return { ...subtask, expanded: !subtask.expanded };
                    }
                    return subtask;
                  })
                };
              } else if (type === "actionItem" && subtaskId && actionItemId) {
                return {
                  ...task,
                  subtasks: task.subtasks.map(subtask => {
                    if (subtask.id === subtaskId) {
                      return {
                        ...subtask,
                        actionItems: subtask.actionItems.map(actionItem => {
                          if (actionItem.id === actionItemId) {
                            return {
                              ...actionItem,
                              expanded: !actionItem.expanded
                            };
                          }
                          return actionItem;
                        })
                      };
                    }
                    return subtask;
                  })
                };
              }
            }
            return task;
          })
        };
      }
      return project;
    }));
  };

  const startTimer = (projectId: string, actionItemId: string) => {
    setTimer({
      projectId,
      actionItemId,
      startTime: new Date(),
      isRunning: true
    });
  };

  const stopTimer = () => {
    if (timer.isRunning && timer.startTime && timer.projectId && timer.actionItemId) {
      const endTime = new Date();
      const timeSpent = Math.floor((endTime.getTime() - timer.startTime.getTime()) / 60000); // minutes

      // Find the action item and update its time spent
      projects.forEach(project => {
        if (project.id === timer.projectId) {
          project.tasks.forEach(task => {
            task.subtasks.forEach(subtask => {
              subtask.actionItems.forEach(actionItem => {
                if (actionItem.id === timer.actionItemId) {
                  updateActionItem(
                    project.id,
                    task.id,
                    subtask.id,
                    actionItem.id,
                    { timeSpent: actionItem.timeSpent + timeSpent }
                  );
                }
              });
            });
          });
        }
      });
    }

    setTimer({
      projectId: null,
      actionItemId: null,
      startTime: null,
      isRunning: false
    });
  };

  const getUserById = (id: string | null) => {
    if (!id) return undefined;
    return users.find(user => user.id === id);
  };

  return (
    <TaskContext.Provider value={{
      projects,
      users,
      timer,
      selectedProject,
      addProject,
      updateProject,
      deleteProject,
      renameProject,
      duplicateProject,
      selectProject,
      addTask,
      updateTask,
      deleteTask,
      addSubtask,
      updateSubtask,
      deleteSubtask,
      addActionItem,
      updateActionItem,
      deleteActionItem,
      addSubactionItem,
      updateSubactionItem,
      deleteSubactionItem,
      toggleExpanded,
      startTimer,
      stopTimer,
      getUserById
    }}>
      {children}
    </TaskContext.Provider>
  );
}

export const useTaskContext = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTaskContext must be used within a TaskProvider");
  }
  return context;
};
