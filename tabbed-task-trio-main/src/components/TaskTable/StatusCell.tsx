
import { cn } from "@/lib/utils";
import { Status } from "../../types/task";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StatusCellProps {
  status: Status;
  onChange: (value: Status) => void;
  disabled?: boolean;
}

const statusOptions = [
  { value: "todo", label: "To Do", icon: "⏳" },
  { value: "inprogress", label: "In Progress", icon: "🔄" },
  { value: "complete", label: "Complete", icon: "✅" },
  { value: "review", label: "Review", icon: "🔍" },
  { value: "closed", label: "Closed", icon: "🚫" },
  { value: "backlog", label: "Backlog", icon: "📋" },
  { value: "clarification", label: "Clarification", icon: "❓" }
];

const statusColors = {
  todo: "text-status-todo",
  inprogress: "text-status-inprogress",
  complete: "text-status-complete",
  review: "text-status-review",
  closed: "text-status-closed",
  backlog: "text-status-backlog",
  clarification: "text-status-clarification"
};


export function StatusCell({ status, onChange, disabled = false }: StatusCellProps) {
  const selectedOption = statusOptions.find(option => option.value === status);
  
  return (
    <Select 
      disabled={disabled}
      value={status} 
      onValueChange={(value) => onChange(value as Status)}
    >
      <SelectTrigger 
        className={cn("border-none min-w-24", statusColors[status])}
      >
        <SelectValue>
          {selectedOption?.icon} {selectedOption?.label}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map(option => (
          <SelectItem 
            key={option.value} 
            value={option.value}
            className={cn(statusColors[option.value as Status])}
          >
            {option.icon} {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
