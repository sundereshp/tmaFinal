
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ActionItem } from "@/types/task";

interface TimerDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  dialogData: {
    taskId: string;
    subtaskId: string;
    actionItems: ActionItem[];
    selectedActionItemId: string | null;
  } | null;
  setDialogData: (data: {
    taskId: string;
    subtaskId: string;
    actionItems: ActionItem[];
    selectedActionItemId: string | null;
  } | null) => void;
  onStartTimer: () => void;
}

export function TimerDialog({ 
  isOpen, 
  onOpenChange, 
  dialogData, 
  setDialogData, 
  onStartTimer 
}: TimerDialogProps) {
  if (!dialogData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Action Item to Start Timer</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <RadioGroup 
            value={dialogData.selectedActionItemId || ""}
            onValueChange={(value) => setDialogData({
              ...dialogData,
              selectedActionItemId: value
            })}
            className="space-y-2"
          >
            {dialogData.actionItems.map((item) => (
              <div key={item.id} className="flex items-center space-x-2 border rounded-md p-2">
                <RadioGroupItem value={item.id} id={`timer-${item.id}`} />
                <Label htmlFor={`timer-${item.id}`} className="flex-1 cursor-pointer">
                  <div className="font-medium">{item.name}</div>
                  {item.estimatedTime && (
                    <div className="text-xs text-muted-foreground">
                      Est: {item.estimatedTime.hours}h {item.estimatedTime.minutes}m
                    </div>
                  )}
                </Label>
              </div>
            ))}
          </RadioGroup>
          
          {(!dialogData.actionItems || dialogData.actionItems.length === 0) && (
            <div className="text-center py-4 text-muted-foreground">
              No action items available in this subtask.
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={onStartTimer}
            disabled={!dialogData.selectedActionItemId}
          >
            Start Timer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
