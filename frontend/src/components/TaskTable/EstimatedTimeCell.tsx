import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

interface EstimatedTimeCellProps {
  estimatedTime: number | null;
  onChange: (time: number | null) => void;
  timeSpent?: number;
  disabled?: boolean;
}

export function EstimatedTimeCell({ 
  estimatedTime, 
  onChange, 
  timeSpent = 0,
  disabled = false 
}: EstimatedTimeCellProps) {
  const [hours, setHours] = useState<string>("");
  const [minutes, setMinutes] = useState<string>("");
  const allowedMinutes = [0, 10, 20, 30, 40, 50];
  
  const hoursRef = useRef<HTMLInputElement>(null);
  const minutesRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (estimatedTime !== null) {
      const parsedHours = Math.floor(estimatedTime);
      const parsedMinutes = Math.round((estimatedTime - parsedHours) * 60);
      setHours(parsedHours.toString());
      setMinutes(parsedMinutes.toString());
    } else {
      setHours("");
      setMinutes("");
    }
  }, [estimatedTime]);

  const convertToDecimalTime = (hours: number, minutes: number): number => {
    return parseFloat((hours + (minutes / 60)).toFixed(2));
  };

  const isValidMinute = (minute: number): boolean => {
    return allowedMinutes.includes(minute);
  };

  const normalizeValues = () => {
    let parsedHours = parseInt(hours) || 0;
    let parsedMinutes = parseInt(minutes) || 0;
    
    // Handle 60-minute rollover
    if (parsedMinutes >= 60) {
      parsedHours += 1;
      parsedMinutes = 0;
    }
    
    // Reset minutes if not valid
    if (parsedMinutes !== 0 && !isValidMinute(parsedMinutes)) {
      parsedMinutes = 0;
      toast.error('Please select a valid minute value (10, 20, 30, 40, 50)');
    }
    
    // Update state with normalized values
    setHours(parsedHours > 0 ? parsedHours.toString() : "");
    setMinutes(parsedMinutes > 0 ? parsedMinutes.toString() : "");
  };

  const handleBlur = () => {
    normalizeValues();
    
    const parsedHours = parseInt(hours) || 0;
    const parsedMinutes = parseInt(minutes) || 0;
    const decimalHours = parsedHours + parsedMinutes/60;
    
    // Only trigger update if value actually changed
    if (decimalHours !== estimatedTime) {
      onChange(decimalHours);
    }
  };

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Only allow non-negative integers
    if (value === "" || (/^\d+$/.test(value) && parseInt(value) <= 999)) {
      setHours(value);
      // Store the current minutes value to maintain it
      const currentMinutes = minutes || "0";
      setMinutes(currentMinutes);
    }
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow any number while typing
    if (value === "" || /^\d{1,2}$/.test(value)) {
      setMinutes(value);
    }
  };

  const roundToNearestAllowed = (value: number): number => {
    // Find the closest allowed value
    const closest = allowedMinutes.reduce((prev, curr) => {
      return Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev;
    });
    return closest;
  };

  const handleMinutesBlur = () => {
    let parsedValue = parseInt(minutes, 10);
    if (isNaN(parsedValue)) {
      setMinutes("0");
      toast.error('Please enter a valid number');
      return;
    }

    // Round to nearest allowed value
    const roundedValue = roundToNearestAllowed(parsedValue);
    if (roundedValue !== parsedValue) {
      toast.info(`Rounded to ${roundedValue} minutes`);
    }
    setMinutes(roundedValue.toString());

    // Calculate decimal hours and update if changed
    const parsedHours = parseInt(hours) || 0;
    const decimalHours = parsedHours + (roundedValue / 60);
    if (decimalHours !== estimatedTime) {
      onChange(decimalHours);
    }
  };

  const handleHoursKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && hours !== "") {
      minutesRef.current?.focus();
    }
  };

  const handleMinutesKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const currentMinutes = parseInt(minutes || "0");
    const currentHours = parseInt(hours || "0");
    
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (currentMinutes === 50) {
        // Wrap to next hour
        setMinutes("0");
        setHours((currentHours + 1).toString());
      } else {
        const nextIndex = allowedMinutes.indexOf(currentMinutes) + 1;
        if (nextIndex < allowedMinutes.length) {
          setMinutes(allowedMinutes[nextIndex].toString());
        }
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (currentMinutes === 0) {
        if (currentHours > 0) {
          setMinutes("50");
          setHours((currentHours - 1).toString());
        }
      } else {
        const prevIndex = allowedMinutes.indexOf(currentMinutes) - 1;
        if (prevIndex >= 0) {
          setMinutes(allowedMinutes[prevIndex].toString());
        }
      }
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
    <div className="space-y-10">
      <div className="flex items-center space-x-2.5">
        <Input
          type="number"
          placeholder="0"
          value={hours || "0"}
          onChange={handleHoursChange}
          onBlur={handleBlur}
          ref={hoursRef}
          onKeyDown={handleHoursKeyDown}
          disabled={disabled}
          className="w-14 h-8 text-center [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <span className="text-center">h</span>
        <Input
          type="number"
          placeholder="0"
          value={minutes}
          onChange={handleMinutesChange}
          onBlur={handleMinutesBlur}
          onKeyDown={handleMinutesKeyDown}
          disabled={disabled}
          className="w-12 h-8 text-center [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <span className="text-center">m</span>
      </div>
      {timeSpent > 0 && (
        <div className="text-xs text-muted-foreground">
          {formatTimeSpent(timeSpent)}
        </div>
      )}
    </div>
  );
}
