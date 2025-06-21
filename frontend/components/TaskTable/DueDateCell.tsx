import { useState } from "react";
import {
  format,
  addDays,
  isBefore,
  isSameDay,
  setHours,
  setMinutes
} from "date-fns";
import { fromZonedTime, toZonedTime, formatInTimeZone } from "date-fns-tz";

import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { CalendarIcon } from "lucide-react";
import { cn } from "../lib/utils";

interface DueDateCellProps {
  dueDate: Date | null; // UTC from DB
  onChange: (dueDate: Date | null) => void; // UTC to backend
  disabled?: boolean;
}

const IST = "Asia/Kolkata";
const DISPLAY_FORMAT = "MMM d,yyyy HH:mm";

export function DueDateCell({ dueDate, onChange, disabled = false }: DueDateCellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempDate, setTempDate] = useState<Date | null>(
    dueDate ? fromZonedTime(dueDate, IST) : null
  );
  const [hour, setHour] = useState<number>(tempDate?.getHours() || 12);
  const [minute, setMinute] = useState<number>(tempDate?.getMinutes() || 0);

  const displayDate = tempDate;

  const handleSelectDate = (date: Date | undefined) => {
    if (!date) {
      onChange(null);
      return;
    }
    const updated = setMinutes(setHours(date, hour), minute);
    setTempDate(updated);
    const utc = toZonedTime(updated, IST);
    onChange(utc);
    setIsOpen(false);
  };

  const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const h = parseInt(e.target.value);
    setHour(h);
    if (tempDate) {
      const updated = setMinutes(setHours(tempDate, h), minute);
      setTempDate(updated);
      onChange(toZonedTime(updated, IST));
    }
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const m = parseInt(e.target.value);
    setMinute(m);
    if (tempDate) {
      const updated = setMinutes(setHours(tempDate, hour), m);
      setTempDate(updated);
      onChange(toZonedTime(updated, IST));
    }
  };

  const formatDisplayDate = (date: Date | null): string => {
    if (!date) return "Pick a date";
    return formatInTimeZone(date, IST, DISPLAY_FORMAT);
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  return (
    <div className="flex items-center">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn("w-[250px] justify-start text-left font-normal px-2")}
            disabled={disabled}
          >
            {formatDisplayDate(displayDate)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="flex gap-4">
            <Calendar
              mode="single"
              selected={displayDate || undefined}
              onSelect={handleSelectDate}
              initialFocus
            />
            <div className="flex flex-col gap-2 text-sm">
              <label className="text-xs">Hour</label>
              <select value={hour} onChange={handleHourChange} className="border rounded px-2 py-1 bg-white dark:bg-gray-700">
                {hours.map((h) => (
                  <option key={h} value={h}>
                    {h.toString().padStart(2, "0")}
                  </option>
                ))}
              </select>

              <label className="text-xs">Minute</label>
              <select value={minute} onChange={handleMinuteChange} className="border rounded px-2 py-1 bg-white dark:bg-gray-700">
                {minutes.map((m) => (
                  <option key={m} value={m}>
                    {m.toString().padStart(2, "0")}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
