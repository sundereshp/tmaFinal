import { Button } from "@/components/ui/button";
import { MinusIcon, PlusIcon, Plus, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';

interface TaskTableHeaderProps {
  projectName: string;
  timer: {
    isRunning: boolean;
    projectId: string | null;
    startTime: Date | null;
  };
  selectedProjectId: string | null;
  onStopTimer: () => void;
}

export function TaskTableHeader({
  projectName,
  timer,
  selectedProjectId,
  onStopTimer
}: TaskTableHeaderProps) {
  const [description, setDescription] = useState("");
  const [savedDescription, setSavedDescription] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const isTimerActiveForProject = timer.isRunning && timer.projectId === selectedProjectId;

  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date);
    if (date && endDate && date > endDate) {
      setEndDate(null); // Reset end date if it's before the new start date
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    if (date && startDate && date < startDate) return;
    setEndDate(date);
  };

  const handleSaveDescription = () => {
    setSavedDescription(description);
    setIsDropdownOpen(false);
    // Persist description, startDate, and endDate as needed
  };

  return (
    <div className="mb-4 flex items-center justify-between sticky top-0 bg-background z-10 px-8 py-3">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold mr-4">{projectName}</h1>

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
