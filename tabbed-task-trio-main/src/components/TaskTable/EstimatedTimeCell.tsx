
import { Input } from "@/components/ui/input";
import { TimeEstimate } from "@/types/task";
import { useState, useRef, useEffect } from "react";

interface EstimatedTimeCellProps {
  estimatedTime: TimeEstimate | null;
  onChange: (time: TimeEstimate | null) => void;
  timeSpent?: number;
  disabled?: boolean;
}

export function EstimatedTimeCell({ 
  estimatedTime, 
  onChange, 
  timeSpent = 0,
  disabled = false 
}: EstimatedTimeCellProps) {
  const [hours, setHours] = useState<string>(estimatedTime?.hours?.toString() || "");
  const [minutes, setMinutes] = useState<string>(estimatedTime?.minutes?.toString() || "");
  
  const hoursRef = useRef<HTMLInputElement>(null);
  const minutesRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (estimatedTime) {
      setHours(estimatedTime.hours.toString());
      setMinutes(estimatedTime.minutes.toString());
    } else {
      setHours("");
      setMinutes("");
    }
  }, [estimatedTime]);

  const handleBlur = () => {
    // Normalize values (e.g., 75 minutes becomes 1h 15m)
    normalizeValues();
    
    const parsedHours = parseInt(hours) || 0;
    const parsedMinutes = parseInt(minutes) || 0;

    if (parsedHours === 0 && parsedMinutes === 0) {
      onChange(null);
    } else {
      onChange({ hours: parsedHours, minutes: parsedMinutes });
    }
  };

  const normalizeValues = () => {
    let parsedHours = parseInt(hours) || 0;
    let parsedMinutes = parseInt(minutes) || 0;
    
    // Convert excess minutes to hours
    if (parsedMinutes >= 60) {
      const additionalHours = Math.floor(parsedMinutes / 60);
      parsedHours += additionalHours;
      parsedMinutes = parsedMinutes % 60;
    }
    
    // Update state with normalized values
    setHours(parsedHours > 0 ? parsedHours.toString() : "");
    setMinutes(parsedMinutes > 0 ? parsedMinutes.toString() : "");
  };

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Only allow non-negative integers
    if (value === "" || /^\d+$/.test(value)) {
      setHours(value);
    }
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Only allow integers between 0-59
    if (value === "" || (/^\d+$/.test(value) && parseInt(value) <= 59)) {
      setMinutes(value);
    }
  };

  const handleHoursKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && hours !== "") {
      minutesRef.current?.focus();
    }
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
    <div className="space-y-1">
      <div className="flex items-center space-x-1 text-xs">
        <Input
          ref={hoursRef}
          disabled={disabled}
          type="text"
          value={hours}
          onChange={handleHoursChange}
          onBlur={handleBlur}
          onKeyDown={handleHoursKeyDown}
          className="w-10 h-6 p-1 text-center border-none"
          placeholder="0"
        />
        <span>h</span>
        <Input
          ref={minutesRef}
          disabled={disabled}
          type="text"
          value={minutes}
          onChange={handleMinutesChange}
          onBlur={handleBlur}
          className="w-10 h-6 p-1 text-center border-none"
          placeholder="0"
        />
        <span>m</span>
      </div>
      {timeSpent > 0 && (
        <div className="text-xs text-muted-foreground">
          {formatTimeSpent(timeSpent)}
        </div>
      )}
    </div>
  );
}
