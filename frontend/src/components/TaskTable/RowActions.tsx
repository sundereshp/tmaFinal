
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Clock, Ellipsis, Trash } from "lucide-react";

interface RowActionsProps {
  onDelete: () => void;
  onStartTimer?: () => void;
  isTimerActive?: boolean;
  showTimer?: boolean;
}

export function RowActions({ onDelete, onStartTimer, isTimerActive, showTimer = true }: RowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0"
        >
          <Ellipsis size={14} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 z-50">
        {showTimer && onStartTimer && (
          <DropdownMenuItem onClick={onStartTimer} className="flex items-center">
            <Clock className="mr-2 h-4 w-4" />
            <span>{isTimerActive ? "Stop Timer" : "Start Timer"}</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem 
          onClick={onDelete}
          className="text-destructive flex items-center"
        >
          <Trash className="mr-2 h-4 w-4" />
          <span>Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
