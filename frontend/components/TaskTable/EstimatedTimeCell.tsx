import { Input } from "../ui/input";
import { CheckIcon, Pencil } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

interface EstimatedTimeCellProps {
  estimatedTime: number | null;
  totalChildEstimatedTime: number; // Add this prop
  onChange: (time: number | null) => void;
  timeSpent?: number;
  disabled?: boolean;
}

export function EstimatedTimeCell({
  estimatedTime,
  totalChildEstimatedTime,
  onChange,
  timeSpent = 0,
  disabled = false
}: EstimatedTimeCellProps) {
  const [localHours, setLocalHours] = useState<string>("");
  const [localMinutes, setLocalMinutes] = useState<string>("");
  const allowedMinutes = [0, 10, 20, 30, 40, 50];

  const hoursRef = useRef<HTMLInputElement>(null);
  const minutesRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const formatTime = (time: number | null) => {
    if (time === null) return "0h";
    const hours = Math.floor(time);
    const minutes = Math.round((time - hours) * 60);
    return `${hours}h ${minutes}m`.replace(/ 0m$/, "");
  };

  const handleEditClick = () => {
    // Initialize local state with current values when starting to edit
    if (estimatedTime !== null) {
      const parsedHours = Math.floor(estimatedTime);
      const parsedMinutes = Math.round((estimatedTime - parsedHours) * 60);
      setLocalHours(parsedHours.toString());
      setLocalMinutes(parsedMinutes.toString());
    } else {
      setLocalHours("");
      setLocalMinutes("");
    }
    setIsEditing(true);
  };

  const handleSave = () => {
    // Only save when the tick button is clicked
    const parsedHours = parseInt(localHours) || 0;
    const parsedMinutes = parseInt(localMinutes) || 0;
    const decimalHours = parsedHours + (parsedMinutes / 60);
    
    // Only update if the value has changed
    if (decimalHours !== estimatedTime) {
      onChange(decimalHours);
    }
    
    setIsEditing(false);
  };

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || (/^\d+$/.test(value) && parseInt(value) <= 999)) {
      setLocalHours(value);
    }
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d{1,2}$/.test(value)) {
      setLocalMinutes(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  const convertToDecimalTime = (hours: number, minutes: number): number => {
    return parseFloat((hours + (minutes / 60)).toFixed(2));
  };

  const isValidMinute = (minute: number): boolean => {
    return allowedMinutes.includes(minute);
  };

  const roundToNearestAllowed = (value: number): number => {
    // Find the closest allowed value
    const closest = allowedMinutes.reduce((prev, curr) => {
      return Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev;
    });
    return closest;
  };

  const formatTimeSpent = (minutes: number): string => {
    if (minutes === 0) return "";

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    let result = "";
    if (hours > 0) result += `${hours}h `;
    if (mins > 0) result += `${mins}m`;

    return result.trim() + " spent";
  };

  return (
    <div 
      ref={containerRef} 
      className="relative flex items-center w-fit"
      onKeyDown={handleKeyDown}
    >
      {isEditing ? (
        <div className="flex items-center gap-1">
          <Input
            type="number"
            placeholder="0"
            value={localHours}
            onChange={handleHoursChange}
            ref={inputRef}
            className="w-10 h-6 text-xs p-0 text-center"
            min="0"
            onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
          />
          <span className="text-xs">h</span>
          <Input
            type="number"
            placeholder="0"
            value={localMinutes}
            onChange={handleMinutesChange}
            className="w-10 h-6 text-xs p-0 text-center"
            min="0"
            max="59"
            onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
          />
          <span className="text-xs">m</span>
          <button 
            onClick={handleSave}
            className="ml-1 p-0.5 text-green-600 hover:text-green-700"
            title="Save"
          >
            <CheckIcon size={14} />
          </button>
        </div>
      ) : (
        <div 
          className="flex items-center gap-1 min-w-[60px] text-sm text-muted-foreground hover:text-foreground cursor-pointer"
          onClick={handleEditClick}
        >
          {estimatedTime !== null ? (
            <>
              <span>{formatTime(estimatedTime)}</span>
              {!disabled && <Pencil size={12} className="ml-1 opacity-0 group-hover:opacity-100" />}
            </>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      )}
    </div>
  );
}
