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
  Trash2,
  User as UserIcon
} from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Comment, User } from "../../types/task";
import { formatDistanceToNow } from "date-fns";
import { getAuthToken } from "../../src/utils/auth";
import { cn } from "../lib/utils";

// Add this interface for API user response
interface ApiUser {
  id: number;
  name: string;
  email: string;
}

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

// Function to generate initials from a name
const getInitials = (name: string) => {
  return name.split(' ').map(word => word.charAt(0).toUpperCase()).join('').slice(0, 2);
};

// Function to generate a consistent color based on name
const getColorForName = (name: string) => {
  const colors = [
    "bg-red-500", "bg-blue-500", "bg-green-500",
    "bg-yellow-500", "bg-purple-500", "bg-pink-500",
    "bg-indigo-500", "bg-teal-500", "bg-orange-500"
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};

interface CommentsCellProps {
  comments?: any;
  onChange: (comments: Comment[]) => void;
  disabled?: boolean;
}

export function CommentsCell({
  comments: propComments = [],
  onChange,
  disabled = false
}: CommentsCellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [normalizedComments, setNormalizedComments] = useState<Comment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Add this utility function to get current user from localStorage
  const getCurrentUser = () => {
    if (typeof window === 'undefined') return null;
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  };

  // Fetch users from the backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          setUsersError('No authentication token found');
          return;
        }

        const response = await fetch('https://vw.aisrv.in/new_backend/users', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ApiUser[] = await response.json();
        
        // Transform API users to match the User type
        const formattedUsers = data.map(user => ({
          id: user.id.toString(),
          name: user.name,
          email: user.email
        }));

        setUsers(formattedUsers);
      } catch (err) {
        console.error('Error fetching users:', err);
        setUsersError('Failed to load users');
      } finally {
        setIsLoadingUsers(false);
      }
    };

    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

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

  // Get user by ID
  const getUserById = (id: string | number) => {
    return users.find(user => user.id === id.toString()) || null;
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || isSubmitting) return;

    // Get current user from localStorage
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.id) {
      console.error('No user found in localStorage');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const comment: Comment = {
        id: Date.now().toString(),
        userId: currentUser.id, // Use the ID from localStorage
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

          <div className="space-y-3 max-h-32 overflow-y-auto pr-2">
            {isLoadingUsers ? (
              <div className="text-sm text-muted-foreground text-center py-4">Loading comments...</div>
            ) : usersError ? (
              <div className="text-sm text-destructive text-center py-4">{usersError}</div>
            ) : normalizedComments.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-4">No comments yet</div>
            ) : (
              normalizedComments.map((comment, index) => {
                const user = getUserById(comment.userId);
                const userInitials = user ? getInitials(user.name) : '??';
                const userColor = user ? getColorForName(user.name) : 'bg-gray-500';
                
                return (
                  <div key={comment.id || index} className="border rounded-lg p-3 bg-muted/30 transition-all duration-200 hover:shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center space-x-2">
                        <div className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0",
                          userColor
                        )}>
                          {userInitials}
                        </div>
                        <span className="text-xs font-medium text-gray-500">
                          {user ? user.name : `User ${comment.userId}`}
                          {comment.createdAt && (
                            <span className="text-muted-foreground"> • {formatDistanceToNow(new Date(comment.createdAt))} ago</span>
                          )}
                        </span>
                      </div>
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
                );
              })
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
