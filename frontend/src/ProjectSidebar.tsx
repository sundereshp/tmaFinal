import { useState } from "react";
import { cn } from "../components/lib/utils";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Plus, Play, MoreVertical, Trash, Pencil, Copy } from "lucide-react";
import { useTaskContext } from "../context/TaskContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Label } from "../components/ui/label";
import { ActionItem } from "../types/task";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "../components/ui/dropdown-menu";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "../components/ui/tooltip";
import Logo from "../source/assets/images/Final.png"; // Assuming the logo is in the assets folder

interface ProjectSidebarProps {
  isCollapsed?: boolean;
}

export function ProjectSidebar({ isCollapsed = false }: ProjectSidebarProps) {
  const {
    projects,
    selectedProject,
    addProject,
    selectProject,
    startTimer,
    timer,
    deleteProject,
    renameProject,
    duplicateProject
  } = useTaskContext();

  const [isAddingProject, setIsAddingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [isTimerDialogOpen, setIsTimerDialogOpen] = useState(false);
  const [selectedProjectForTimer, setSelectedProjectForTimer] = useState<string | null>(null);
  const [selectedActionItem, setSelectedActionItem] = useState<string | null>(null);

  const [renamingProject, setRenamingProject] = useState<{ id: string, name: string } | null>(null);

  // Function to flatten project structure and get all action items
  const getAllActionItems = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return [];

    const actionItems: { id: string; name: string; path: string }[] = [];

    project.tasks.forEach(task => {
      task.subtasks.forEach(subtask => {
        subtask.actionItems.forEach(actionItem => {
          actionItems.push({
            id: actionItem.id,
            name: actionItem.name,
            path: `${task.name} > ${subtask.name} > ${actionItem.name}`
          });
        });
      });
    });

    return actionItems;
  };

  const handleAddProject = async () => {
    if (newProjectName.trim()) {
      try {
        const newProject = {
          id: Date.now().toString(),
          name: newProjectName.trim(),
          description: '',
          userID: 1,
          wsID: 1,
          estHours: 0,
          tasks: []
        };

        // Update local state
        addProject(newProject.name);
        setNewProjectName("");
        setIsAddingProject(false);
        toast.success("Project created successfully");
      } catch (error) {
        console.error('Error creating project:', error);
        toast.error("Failed to create project");
      }
    }
  };

  const handleRenameProject = async (id: string) => {
    if (renamingProject && renamingProject.name.trim()) {
      try {
        // Update local state
        renameProject(id, renamingProject.name.trim());
        setRenamingProject(null);
        toast.success("Project renamed successfully");
      } catch (error) {
        console.error('Error renaming project:', error);
        toast.error("Failed to rename project");
      }
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        // Update local state
        deleteProject(id);
        toast.success("Project deleted successfully");
      } catch (error) {
        console.error('Error deleting project:', error);
        toast.error("Failed to delete project");
      }
    }
  };

  const handleStartTimer = () => {
    if (selectedProjectForTimer && selectedActionItem) {
      startTimer(selectedProjectForTimer, selectedActionItem);
      setIsTimerDialogOpen(false);
    }
  };

  const openTimerDialog = (projectId: string) => {
    setSelectedProjectForTimer(projectId);
    setSelectedActionItem(null);
    setIsTimerDialogOpen(true);
  };

  const handleDuplicateProject = (id: string) => {
    duplicateProject(id);
    toast.success("Project duplicated");
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-sidebar">
      {/* Logo Section */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-center">
          <img
            src={Logo}
            alt="Company Logo"
            className="h-8 w-auto"
          />
        </div>
      </div>
      
      {/* Scrollable Projects Section */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Projects Header */}
        <div className="p-4 pb-2">
          <div className="flex justify-between items-center">
            {!isCollapsed && <h2 className="font-semibold text-sidebar-foreground">Projects</h2>}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAddingProject(!isCollapsed && true)}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Add Project</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Scrollable Projects List */}
        <div className="flex-1 overflow-y-auto px-4">
          {!isCollapsed && isAddingProject && (
            <div className="flex items-center gap-2 mb-4">
              <Input
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Project name"
                className="h-8"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddProject();
                  if (e.key === "Escape") setIsAddingProject(false);
                }}
              />
              <Button size="sm" onClick={handleAddProject} className="h-8">Add</Button>
            </div>
          )}

          <div className="space-y-1">
            {projects.map((project) => (
              <div
                key={project.id}
                className={cn(
                  "flex items-center justify-between rounded-md px-2 py-1.5",
                  selectedProject?.id === project.id
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                {renamingProject && renamingProject.id === project.id && !isCollapsed ? (
                  <Input
                    value={renamingProject.name}
                    onChange={(e) => setRenamingProject({ ...renamingProject, name: e.target.value })}
                    autoFocus
                    className="h-7 py-0 px-1 text-sm"
                    onBlur={() => handleRenameProject(project.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRenameProject(project.id);
                      if (e.key === "Escape") setRenamingProject(null);
                    }}
                  />
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className={cn(
                          "text-sm font-medium text-left truncate",
                          isCollapsed ? "w-8 mx-auto flex justify-center" : "flex-1"
                        )}
                        onClick={() => selectProject(project.id)}
                      >
                        {isCollapsed ? project.name.charAt(0).toUpperCase() : project.name}
                      </button>
                    </TooltipTrigger>
                    {isCollapsed && <TooltipContent side="right">{project.name}</TooltipContent>}
                  </Tooltip>
                )}

                {!isCollapsed && (
                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "h-6 w-6 p-0 flex-shrink-0",
                            timer.isRunning && timer.projectId === project.id ? "text-green-500 timer-active" : ""
                          )}
                          onClick={() => openTimerDialog(project.id)}
                        >
                          <Play className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Start Timer</TooltipContent>
                    </Tooltip>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 flex-shrink-0">
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem
                          onClick={() => setRenamingProject({ id: project.id, name: project.name })}
                          className="flex items-center"
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          <span>Rename Project</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDuplicateProject(project.id)}
                          className="flex items-center"
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          <span>Duplicate Project</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteProject(project.id)}
                          className="flex items-center text-destructive"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          <span>Delete Project</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Monitoring Section at Bottom */}
      <div className="border-t border-border p-4">
        <div className="space-y-2">
          {!isCollapsed && (
            <h2 className="text-xs font-semibold text-muted-foreground px-2">
              Monitoring
            </h2>
          )}
          <Button
            variant="ghost"
            className={cn(
              "w-full flex items-center justify-start gap-2 px-2 py-1.5 text-sm font-medium rounded-md",
              "text-sidebar-foreground hover:bg-sidebar-accent/50",
              isCollapsed && "justify-center"
            )}
            onClick={(e) => {
              if (e.ctrlKey || e.metaKey) {
                window.open("https://vw.aisrv.in/madhavan", "_blank");
              } else {
                window.location.href = "https://vw.aisrv.in/madhavan";
              }
            }}
          >
            <span>{isCollapsed ? "📊" : "Go to Monitoring"}</span>
          </Button>
        </div>
      </div>

      {/* Timer Dialog */}
      <Dialog open={isTimerDialogOpen} onOpenChange={setIsTimerDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Action Item to Start Timer</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            {selectedProjectForTimer && getAllActionItems(selectedProjectForTimer).map((item) => (
              <div key={item.id} className="flex items-center space-x-2 border rounded-md p-2">
                <RadioGroupItem value={item.id} id={item.id} />
                <Label htmlFor={item.id} className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-muted-foreground">{item.path}</div>
                </Label>
              </div>
            ))}

            {selectedProjectForTimer && getAllActionItems(selectedProjectForTimer).length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                No action items available in this project.
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsTimerDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleStartTimer}
              disabled={!selectedActionItem}
            >
              Start Timer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
