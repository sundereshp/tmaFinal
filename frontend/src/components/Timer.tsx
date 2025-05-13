
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useTaskContext } from "../context/TaskContext";
import { format } from "date-fns";

export function Timer() {
  const { timer, stopTimer } = useTaskContext();
  const [elapsedTime, setElapsedTime] = useState("00:00:00");
  
  useEffect(() => {
    if (!timer.isRunning || !timer.startTime) return;
    
    const updateElapsedTime = () => {
      const now = new Date();
      const diff = now.getTime() - timer.startTime!.getTime();
      
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      
      const formatted = 
        (hours < 10 ? "0" : "") + hours + ":" +
        (minutes < 10 ? "0" : "") + minutes + ":" +
        (seconds < 10 ? "0" : "") + seconds;
      
      setElapsedTime(formatted);
    };
    
    // Update immediately
    updateElapsedTime();
    
    // Then update every second
    const interval = setInterval(updateElapsedTime, 1000);
    return () => clearInterval(interval);
  }, [timer.isRunning, timer.startTime]);

  if (!timer.isRunning) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-card shadow-lg rounded-lg p-3 border">
      <div className="flex items-center gap-4">
        <div>
          <div className="text-xs text-muted-foreground">Timer started at</div>
          <div className="font-medium">{format(timer.startTime!, "HH:mm:ss")}</div>
        </div>
        <div className="text-lg font-bold tabular-nums">{elapsedTime}</div>
        <Button 
          variant="destructive" 
          size="sm"
          onClick={stopTimer}
        >
          Stop
        </Button>
      </div>
    </div>
  );
}
