import { useState, useEffect, useRef } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "../ui/popover";
import {
  MessageSquare,
  MessageSquareText,
  Plus,
  X,
  Pencil,
  Trash2
} from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Comment } from "../../types/task";
import { formatDistanceToNow } from "date-fns";

const normalizeComments = (comments: any): Comment[] => {
  if (!comments) return [];
  if (typeof comments === "string") {
    try {
      const parsed = JSON.parse(comments);
      return Array.isArray(parsed)
        ? parsed.map((c) => (typeof c === "string" ? { 
            id: Date.now().toString(),
            userId: 0, 
            text: c, 
            createdAt: new Date().toISOString() 
          } : {
            id: c.id || Date.now().toString(),
            userId: c.userId || c.userID || 0,
            text: c.text,
            createdAt: c.createdAt || new Date().toISOString()
          }))
        : [{
            id: Date.now().toString(),
            userId: 1, 
            text: parsed, 
            createdAt: new Date().toISOString()
          }];
    } catch {
      return [{
        id: Date.now().toString(),
        userId: 1, 
        text: comments, 
        createdAt: new Date().toISOString()
      }];
    }
  }
  if (Array.isArray(comments)) {
    return comments.map((c) =>
      typeof c === "string" ? {
        id: Date.now().toString(),
        userId: 0, 
        text: c,
        createdAt: new Date().toISOString()
      } : {
        id: c.id || Date.now().toString(),
        userId: c.userId || c.userID || 0,
        text: c.text,
        createdAt: c.createdAt || new Date().toISOString()
      }
    );
  }
  return [];
};

interface CommentsCellProps {
  comments?: any;
  userID?: number;
  onChange: (comments: Comment[]) => void;
  disabled?: boolean;
}

export function CommentsCell({
  comments: propComments = [],
  onChange,
  userID,
  disabled = false
}: CommentsCellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [normalizedComments, setNormalizedComments] = useState<Comment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Update normalized comments when prop changes
  useEffect(() => {
    const newNormalizedComments = normalizeComments(propComments);
    setNormalizedComments(newNormalizedComments);
  }, [propComments]);

  // Focus input when popover opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    setTimeout(() => {
      commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !userID || isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      const comment: Comment = {
        id: Date.now().toString(),
        userId: userID, // Match backend expectation
        text: newComment.trim(),
        createdAt: new Date().toISOString()
      };

      // Optimistically update UI
      const updatedComments = [...normalizedComments, comment];
      setNormalizedComments(updatedComments);
      setNewComment("");
      scrollToBottom();

      // Send to backend
      await onChange(updatedComments);
      
    } catch (error) {
      console.error('Error adding comment:', error);
      // Revert optimistic update on error
      setNormalizedComments(normalizeComments(propComments));
      setNewComment(newComment); // Restore the comment text
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditText(normalizedComments[index].text);
  };

  const handleUpdateComment = async () => {
    if (editingIndex === null || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const updatedComments = [...normalizedComments];
      updatedComments[editingIndex] = {
        ...updatedComments[editingIndex],
        text: editText.trim()
      };
      
      // Optimistically update UI
      setNormalizedComments(updatedComments);
      setEditingIndex(null);
      setEditText("");
      
      // Send to backend
      await onChange(updatedComments);
      
    } catch (error) {
      console.error('Error updating comment:', error);
      // Revert optimistic update on error
      setNormalizedComments(normalizeComments(propComments));
      setEditingIndex(null);
      setEditText("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (index: number) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const updatedComments = normalizedComments.filter((_, i) => i !== index);
      
      // Optimistically update UI
      setNormalizedComments(updatedComments);
      
      // Send to backend
      await onChange(updatedComments);
      
    } catch (error) {
      console.error('Error deleting comment:', error);
      // Revert optimistic update on error
      setNormalizedComments(normalizeComments(propComments));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditText("");
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-6 w-6 p-0 relative ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
          disabled={disabled}
        >
          {normalizedComments.length > 0 ? (
            <MessageSquareText size={16} />
          ) : (
            <MessageSquare size={16} />
          )}
          {normalizedComments.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center text-xs">
              {normalizedComments.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-96 p-4 bg-white dark:bg-gray-800" align="center">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="text-sm font-medium">Comments ({normalizedComments.length})</div>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setIsOpen(false)}>
              <X size={16} />
            </Button>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
            {normalizedComments.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-4">No comments yet</div>
            ) : (
              normalizedComments.map((comment, index) => (
                <div key={comment.id || index} className="border rounded-lg p-3 bg-muted/30 transition-all duration-200 hover:shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-gray-500">
                      User {comment.userId}
                      {comment.createdAt && (
                        <> • {formatDistanceToNow(new Date(comment.createdAt))} ago</>
                      )}
                    </span>
                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6" 
                        onClick={() => handleStartEdit(index)}
                        disabled={isSubmitting}
                      >
                        <Pencil size={12} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteComment(index)}
                        disabled={isSubmitting}
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </div>

                  {editingIndex === index ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="min-h-[80px] text-sm"
                        autoFocus
                        disabled={isSubmitting}
                      />
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleCancelEdit}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={handleUpdateComment}
                          disabled={isSubmitting || !editText.trim()}
                        >
                          {isSubmitting ? 'Saving...' : 'Save'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{comment.text}</p>
                  )}
                </div>
              ))
            )}
            <div ref={commentsEndRef} />
          </div>

          <div className="border-t pt-3 mt-2">
            <Textarea
              ref={inputRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="min-h-[80px] mb-2 text-sm"
              disabled={isSubmitting}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAddComment();
                }
              }}
            />
            <div className="flex justify-end">
              <Button 
                size="sm" 
                onClick={handleAddComment} 
                disabled={!newComment.trim() || isSubmitting}
              >
                <Plus size={16} className="mr-1" /> 
                {isSubmitting ? 'Adding...' : 'Add Comment'}
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}