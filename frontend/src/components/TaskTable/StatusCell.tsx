import { cn } from "@/lib/utils";
import { Status } from "../../types/task";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CircleDashed, CircleDot, CircleCheckBig, Bookmark, CircleX, Archive, FileQuestion } from "lucide-react";

interface StatusCellProps {
  status: Status;
  onChange: (value: Status) => void;
  disabled?: boolean;
}

const statusOptions = [
  { 
    value: "todo", 
    label: "To Do", 
    icon: <CircleDashed className="h-4 w-4" /> 
  },
  { 
    value: "inprogress", 
    label: "In Progress", 
    icon: <CircleDot className="h-4 w-4" /> 
  },
  { 
    value: "complete", 
    label: "Complete", 
    icon: <CircleCheckBig className="h-4 w-4" /> 
  },
  { 
    value: "review", 
    label: "Review", 
    icon: <Bookmark className="h-4 w-4" /> 
  },
  { 
    value: "closed", 
    label: "Closed", 
    icon: <CircleX className="h-4 w-4" /> 
  },
  { 
    value: "backlog", 
    label: "Backlog", 
    icon: <Archive className="h-4 w-4" /> 
  },
  { 
    value: "clarification", 
    label: "Clarification", 
    icon: <FileQuestion className="h-4 w-4" /> 
  }
];

const statusColors = {
  todo: "text-gray-500 dark:text-gray-300",
  inprogress: "text-blue-500 dark:text-blue-400",
  complete: "text-green-500 dark:text-green-400",
  review: "text-violet-500 dark:text-violet-400",
  closed: "text-rose-500 dark:text-rose-400",
  backlog: "text-orange-500 dark:text-amber-400",
  clarification: "text-amber-500 dark:text-amber-400"
} as const;

export function StatusCell({ status, onChange, disabled = false }: StatusCellProps) {
  const selectedOption = statusOptions.find(option => option.value === status);
  
  return (
    <Select 
      disabled={disabled}
      value={status} 
      onValueChange={(value) => onChange(value as Status)}
    >
      <SelectTrigger 
        className={cn("border-none min-w-24 flex items-center gap-2", statusColors[status])}
      >
        <SelectValue>
          <span className="flex items-center gap-2">
            {selectedOption?.icon}
            <span className="truncate">{selectedOption?.label}</span>
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map(option => (
          <SelectItem 
            key={option.value} 
            value={option.value}
            className={cn("flex items-center gap-2", statusColors[option.value as Status])}
          >
            <span className="flex items-center gap-2">
              {option.icon}
              <span>{option.label}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
