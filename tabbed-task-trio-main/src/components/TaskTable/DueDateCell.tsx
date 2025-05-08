
import { useState } from "react";
import { format, addDays, isBefore, isAfter, isSameDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DueDateCellProps {
  dueDate: Date | null;
  onChange: (dueDate: Date | null) => void;
  disabled?: boolean;
}

export function DueDateCell({ dueDate, onChange, disabled = false }: DueDateCellProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Predefined date options
  const today = new Date();
  const predefinedOptions = [
    { label: "Today", date: today },
    { label: "Tomorrow", date: addDays(today, 1) },
    { label: "This weekend", date: addDays(today, 6 - today.getDay()) }, // Saturday
    { label: "Next week", date: addDays(today, 7) },
    { label: "Next weekend", date: addDays(today, 13 - today.getDay()) }, // Next Saturday
    { label: "In 2 weeks", date: addDays(today, 14) },
    { label: "In 4 weeks", date: addDays(today, 28) },
    { label: "No due date", date: null },
  ];
  
  const handleSelectPredefined = (date: Date | null) => {
    onChange(date);
    setIsOpen(false);
  };
  
  const handleSelectCalendarDate = (date: Date | null) => {
    onChange(date);
    setIsOpen(false);
  };

  // Format due date for display
  const formatDueDate = (date: Date | null): string => {
    if (!date) return "";
    
    // Check if it's a predefined date
    for (const option of predefinedOptions) {
      if (option.date && isSameDay(option.date, date)) {
        return option.label;
      }
    }
    
    // If it's today or tomorrow
    if (isSameDay(date, today)) {
      return "Today";
    } else if (isSameDay(date, addDays(today, 1))) {
      return "Tomorrow";
    }
    
    // Check if it's in the past
    if (isBefore(date, today) && !isSameDay(date, today)) {
      return `${format(date, "MMM d")} (Overdue)`;
    }
    
    // Default format
    return format(date, "MMM d");
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant={dueDate ? "outline" : "ghost"}
          size="sm" 
          className={cn(
            "h-6 px-2 text-xs justify-start", 
            dueDate && isBefore(dueDate, today) && !isSameDay(dueDate, today) ? "text-destructive" : "",
            disabled ? "cursor-not-allowed opacity-50" : ""
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-1 h-3 w-3" />
          <span className="truncate">
            {dueDate ? formatDueDate(dueDate) : "Set date"}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-800" align="start">
        <div className="flex">
          <div className="border-r border-border">
            <div className="p-2 font-medium text-sm">
              Presets
            </div>
            <div className="px-1 pb-2">
              {predefinedOptions.map((option, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-left px-2 py-1 h-8"
                  onClick={() => handleSelectPredefined(option.date)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <Calendar
              mode="single"
              selected={dueDate || undefined}
              onSelect={handleSelectCalendarDate}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
