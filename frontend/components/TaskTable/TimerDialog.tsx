import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Input } from "../ui/input";
import { ActionItem } from "../../types/task";

interface TimerDialogProps {
  open: boolean;
  onClose: () => void;
  taskId: string;
  subtaskId: string;
  actionItemId: string;
  subactionItemId: string;
  actionItems?: ActionItem[];
  onSelectActionItem?: (actionItemId: string) => void;
  onStartTimer?: (actionItemId: string) => void;
}

export function TimerDialog({ 
  open, 
  onClose, 
  taskId, 
  subtaskId, 
  actionItemId, 
  subactionItemId,
  actionItems = [],
  onSelectActionItem,
  onStartTimer
}: TimerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start Timer</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {actionItems.length > 0 && (
            <div className="space-y-2">
              <Label>Select Action Item</Label>
              <Select
                value={actionItemId}
                onValueChange={(value) => {
                  onSelectActionItem?.(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an action item" />
                </SelectTrigger>
                <SelectContent>
                  {actionItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Task ID</Label>
            <Input 
              type="text" 
              value={taskId} 
              disabled 
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Subtask ID</Label>
            <Input 
              type="text" 
              value={subtaskId} 
              disabled 
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Action Item ID</Label>
            <Input 
              type="text" 
              value={actionItemId} 
              disabled 
              className="w-full"
            />
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => {
              onStartTimer?.(actionItemId);
              onClose();
            }}
            disabled={!actionItemId}
          >
            Start Timer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
