import { cn } from "../lib/utils";
import { Priority } from "../../types/task";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface PriorityCellProps {
  priority: Priority;
  onChange: (value: Priority) => void;
  disabled?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const priorityOptions = [
  { value: "urgent", label: "Urgent", icon: "🔴" },
  { value: "high", label: "High", icon: "🟠" },
  { value: "normal", label: "Normal", icon: "🟡" },
  { value: "low", label: "Low", icon: "🟢" },
  { value: "none", label: "None", icon: "❌" }
];

const priorityColors = {
  urgent: "text-priority-urgent",
  high: "text-priority-high",
  normal: "text-priority-normal",
  low: "text-priority-low",
  none: "text-priority-none"
};

export function PriorityCell({ priority, onChange, disabled = false, onOpenChange }: PriorityCellProps) {
  const selectedOption = priorityOptions.find(option => option.value === priority);
  
  return (
    <Select 
      disabled={disabled}
      value={priority} 
      onValueChange={(value) => onChange(value as Priority)}
      onOpenChange={onOpenChange}
    >
      <SelectTrigger 
        className={cn(
          "flex h-8 w-16 items-center justify-between rounded-md border-none bg-background px-2 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
          priorityColors[priority]
        )}
      >
        <SelectValue>
          {selectedOption?.icon || "🟡"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {priorityOptions.map(option => (
          <SelectItem 
            key={option.value} 
            value={option.value}
            className={cn(priorityColors[option.value as Priority])}
          >
            {option.icon} {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
