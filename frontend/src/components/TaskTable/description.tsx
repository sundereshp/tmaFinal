import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface DescriptionCellProps {
  description: string;
  onChange: (description: string) => void;
  disabled?: boolean;
}

export function DescriptionCell({ description, onChange, disabled = false }: DescriptionCellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editedDescription, setEditedDescription] = useState(description);

  const handleSave = () => {
    onChange(editedDescription);
    setIsOpen(false); // Close the popover after saving
  };

  const handleCancel = () => {
    setEditedDescription(description);
    setIsOpen(false);
  };

  // Update editedDescription when description prop changes
  if (description !== editedDescription && !isOpen) {
    setEditedDescription(description);
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={`h-6 w-6 p-0 ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
          disabled={disabled}
        >
          <Info size={16} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 bg-white dark:bg-gray-800" align="center">
        <div className="space-y-2">
          <div className="text-sm font-medium">Description</div>
          <Textarea 
            value={editedDescription} 
            onChange={(e) => setEditedDescription(e.target.value)} 
            placeholder="Add your description here..." 
            className="min-h-[100px]"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}