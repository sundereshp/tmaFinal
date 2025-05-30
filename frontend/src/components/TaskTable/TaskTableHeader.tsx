import { Button } from "@/components/ui/button";
import { MinusIcon, PlusIcon, Plus, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import { addDays, format, parseISO } from "date-fns";
import { useTaskContext } from "../../context/TaskContext";
import { toast } from "sonner";
interface TaskTableHeaderProps {
  projectName: string;
  projectId: string;
  projectDescription?: string;
  projectStartDate?: string;
  projectEndDate?: string;
  projectEstHours?: number;
  projectActHours?: number;
  timer: {
    isRunning: boolean;
    projectId: string | null;
    startTime: Date | null;
  };
  selectedProjectId: string | null;
  onStopTimer: () => void;
  totalEstimatedTime: number;
}

export function TaskTableHeader({
  projectName,
  projectId,
  projectDescription,
  projectStartDate,
  projectEndDate,
  projectEstHours,
  projectActHours,
  timer,
  selectedProjectId,
  onStopTimer,
  totalEstimatedTime
}: TaskTableHeaderProps) {
  const [description, setDescription] = useState("");
  const [savedDescription, setSavedDescription] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const isTimerActiveForProject = timer.isRunning && timer.projectId === selectedProjectId;
  const { updateProject } = useTaskContext();
  const [estHours, setEstHours] = useState(projectEstHours || 0);
  const [actHours, setActHours] = useState(projectActHours || 0);

  // In TaskTableHeader.tsx
  useEffect(() => {
    setDescription(projectDescription || "");
    setSavedDescription(projectDescription || "");

    // Handle both string and Date objects for dates
    setStartDate(projectStartDate ?
      (typeof projectStartDate === 'string' ?
        parseISO(projectStartDate) :
        new Date(projectStartDate)
      ) : null
    );

    setEndDate(projectEndDate ?
      (typeof projectEndDate === 'string' ?
        parseISO(projectEndDate) :
        new Date(projectEndDate)
      ) : null
    );

    setEstHours(projectEstHours || 0);
    setActHours(projectActHours || 0);
  }, [projectDescription, projectStartDate, projectEndDate, projectEstHours, projectActHours]);


  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date);
    if (date && endDate && date > endDate) {
      setEndDate(date); // Set end date to start date if it's before
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    if (date && startDate && date < startDate) return;
    setEndDate(date);
  };

  const handleSaveDescription = async () => {
    try {
      await updateProject(
        projectId,
        projectName, // Keep the existing name
        description,
        startDate ? startDate.toISOString() : new Date().toISOString(),
        endDate ? endDate.toISOString() : addDays(new Date(), 30).toISOString(),
        estHours,
        actHours
      );
      setSavedDescription(description);
      setIsDropdownOpen(false);
      toast.success("Project updated successfully");
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error("Failed to update project");
    }
  };
  const formatTime = (time: number) => {
    const hours = Math.floor(time);
    const minutes = Math.round((time - hours) * 60);
    return `${hours}h ${minutes}m`.replace(/ 0m$/, "");
  };
  return (
    <div className="mb-4 flex items-center justify-between sticky top-0 bg-background z-10 px-8 py-3">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold mr-4">{projectName}</h1>
        {totalEstimatedTime > 0 && (
          <span className="text-muted-foreground ml-2 text-lg">
            ({formatTime(totalEstimatedTime)})
          </span>
        )}
        <div className="flex items-center space-x-1 bg-muted/50 rounded-md p-1">
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-3 w-72 max-h-96 overflow-auto space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Project Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter project description..."
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Start Date</label>
                <DatePicker
                  selected={startDate}
                  onChange={handleStartDateChange}
                  placeholderText="Pick a start date"
                  className="w-full border px-2 py-1 rounded text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  calendarClassName="dark:bg-gray-800 dark:text-white"
                  dayClassName={(date) =>
                    startDate && date.getDate() === startDate.getDate() && date.getMonth() === startDate.getMonth()
                      ? 'dark:bg-blue-600 dark:text-white'
                      : 'dark:text-white'
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">End Date</label>
                <DatePicker
                  selected={endDate}
                  onChange={handleEndDateChange}
                  placeholderText="Pick an end date"
                  className="w-full border px-2 py-1 rounded text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  calendarClassName="dark:bg-gray-800 dark:text-white"
                  dayClassName={(date) =>
                    endDate && date.getDate() === endDate.getDate() && date.getMonth() === endDate.getMonth()
                      ? 'dark:bg-blue-600 dark:text-white'
                      : 'dark:text-white'
                  }
                  minDate={startDate || undefined}
                />
              </div>

              <Button size="sm" className="w-full mt-2" onClick={handleSaveDescription}>
                Save
              </Button>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isTimerActiveForProject && (
        <div className="flex items-center space-x-4">
          <div className="text-sm">
            <span className="timer-active font-medium">Timer running: </span>
            <span>{format(timer.startTime!, "HH:mm:ss")}</span>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={onStopTimer}
          >
            Stop Timer
          </Button>
        </div>
      )}

    </div>
  );
}
