
import { useState } from "react";
import { format, addDays, isBefore, isAfter, isSameDay } from "date-fns";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { CalendarIcon } from "lucide-react";
import { cn } from "../lib/utils";

interface DueDateCellProps {
  dueDate: Date | null;
  onChange: (dueDate: Date | null) => void;
  disabled?: boolean;
}

export function DueDateCell({ dueDate, onChange, disabled = false }: DueDateCellProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Predefined date options (calculated on each render)
  const today = new Date();
  const predefinedOptions = [
    { label: "Today", getDate: () => new Date(today.getFullYear(), today.getMonth(), today.getDate()) },
    { label: "Tomorrow", getDate: () => addDays(new Date(today.getFullYear(), today.getMonth(), today.getDate()), 1) },
    {
      label: "This weekend",
      getDate: () => {
        const day = today.getDay();
        // Saturday of this week
        return addDays(new Date(today.getFullYear(), today.getMonth(), today.getDate()), day === 6 ? 0 : 6 - day);
      }
    },
    { label: "Next week", getDate: () => addDays(new Date(today.getFullYear(), today.getMonth(), today.getDate()), 7) },
    {
      label: "Next weekend",
      getDate: () => {
        const day = today.getDay();
        // Saturday of next week
        return addDays(new Date(today.getFullYear(), today.getMonth(), today.getDate()), day === 6 ? 7 : 13 - day);
      }
    },
    { label: "In 2 weeks", getDate: () => addDays(new Date(today.getFullYear(), today.getMonth(), today.getDate()), 14) },
    { label: "In 4 weeks", getDate: () => addDays(new Date(today.getFullYear(), today.getMonth(), today.getDate()), 28) },
    { label: "No due date", getDate: () => null },
  ];

  const handleSelectPredefined = (getDateFn: () => Date | null) => {
    onChange(getDateFn());
    setIsOpen(false);
  };

  const handleSelectCalendarDate = (date: Date | null) => {
    onChange(date);
    setIsOpen(false);
  };

  // Format due date for display
  const formatDueDate = (date: Date | null): string => {
    if (!date) return "";
    const today = new Date();
    if (isBefore(date, today) && !isSameDay(date, today)) {
      return `${format(date, "dd-MM-yyyy")} (Overdue)`;
    }
    return format(date, "dd-MM-yyyy");
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
                  onClick={() => handleSelectPredefined(option.getDate)}
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
