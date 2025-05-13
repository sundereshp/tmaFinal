
import { cn } from "@/lib/utils";
import { Priority } from "../../types/task";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PriorityCellProps {
  priority: Priority;
  onChange: (value: Priority) => void;
  disabled?: boolean;
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

export function PriorityCell({ priority, onChange, disabled = false }: PriorityCellProps) {
  const selectedOption = priorityOptions.find(option => option.value === priority);
  
  return (
    <Select 
      disabled={disabled}
      value={priority} 
      onValueChange={(value) => onChange(value as Priority)}
    >
      <SelectTrigger 
        className={cn("border-none w-16", priorityColors[priority])}
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
