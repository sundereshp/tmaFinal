
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MessageSquare, MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface CommentsCellProps {
  comments: string;
  onChange: (comments: string) => void;
  disabled?: boolean;
}

export function CommentsCell({ comments, onChange, disabled = false }: CommentsCellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editedComments, setEditedComments] = useState(comments);

  const handleSave = () => {
    onChange(editedComments);
    setIsOpen(false); // Close the popover after saving
  };

  const handleCancel = () => {
    setEditedComments(comments);
    setIsOpen(false);
  };

  // Update editedComments when comments prop changes
  if (comments !== editedComments && !isOpen) {
    setEditedComments(comments);
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
          {comments ? <MessageSquareText size={16} /> : <MessageSquare size={16} />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 bg-white dark:bg-gray-800" align="center">
        <div className="space-y-2">
          <div className="text-sm font-medium">Comments</div>
          <Textarea 
            value={editedComments} 
            onChange={(e) => setEditedComments(e.target.value)} 
            placeholder="Add your comments here..." 
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
