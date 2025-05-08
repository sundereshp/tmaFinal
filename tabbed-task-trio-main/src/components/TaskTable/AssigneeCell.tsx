import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from "@/types/task";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface AssigneeCellProps {
  users: User[];
  assigneeId: string[] | null;
  onChange: (userId: string[] | null) => void;
  disabled?: boolean;
}

export function AssigneeCell({ users, assigneeId, onChange, disabled = false }: AssigneeCellProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [showPopover, setShowPopover] = useState(false);

  const handleToggleUser = (userId: string) => {
    if (!assigneeId || !assigneeId.includes(userId)) {
      // Check if we've reached the maximum number of assignees
      if (assigneeId && assigneeId.length >= 3) {
        return; // Don't allow adding more than 3 assignees
      }
      // Add user
      const newAssignees = [...(assigneeId || []), userId];
      onChange(newAssignees);
    } else {
      // Remove user
      handleRemoveUser(userId);
    }
    setIsAdding(false);
  };
  
  const handleRemoveUser = (userId: string) => {
    const newAssignees = assigneeId ? assigneeId.filter(id => id !== userId) : [];
    onChange(newAssignees.length ? newAssignees : null);
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

  // Ensure assigneeId is always an array
  const assigneeArray = assigneeId ? (Array.isArray(assigneeId) ? assigneeId : [assigneeId]) : [];
  const visibleAssignees = assigneeArray.slice(0, 3);
  const additionalCount = assigneeArray.length - 3;

  return (
    <div className="flex flex-wrap gap-1 items-center min-h-[28px]">
      {/* Show assignee avatars */}
      {visibleAssignees.map(id => {
        const user = users.find(u => u.id === id);
        if (!user) return null;
        
        return (
          <div 
            key={id}
            className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium cursor-pointer", 
              getColorForName(user.name)
            )}
            onClick={() => !disabled && handleRemoveUser(id)}
            title={user.name}
          >
            {getInitials(user.name)}
          </div>
        );
      })}
      
      {/* Show +X button for additional assignees */}
      {additionalCount > 0 && (
        <Popover open={showPopover} onOpenChange={setShowPopover}>
          <PopoverTrigger asChild>
            <div
              className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-medium cursor-pointer"
              title="Show all assignees"
            >
              +{additionalCount}
            </div>
          </PopoverTrigger>
          <PopoverContent className="p-2 w-48 bg-white dark:bg-gray-800 z-50">
            <div className="text-sm font-medium mb-2">All Assignees</div>
            <div className="space-y-2">
              {assigneeArray.slice(3).map(id => {
                const user = users.find(u => u.id === id);
                if (!user) return null;
                
                return (
                  <div key={id} className="flex items-center gap-2">
                    <div 
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium", 
                        getColorForName(user.name)
                      )}
                    >
                      {getInitials(user.name)}
                    </div>
                    <span className="text-sm">{user.name}</span>
                    {!disabled && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="ml-auto h-6 w-6 p-0" 
                        onClick={() => handleRemoveUser(id)}
                      >
                        <X size={12} />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      )}
      
      {/* Show + button to add assignee */}
      {assigneeArray.length < 3 && !disabled && (
        <Popover open={showPopover} onOpenChange={setShowPopover}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
              onClick={(e) => {
                e.stopPropagation();
                setShowPopover(true);
              }}
              disabled={disabled}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-2 w-48 bg-white dark:bg-gray-800 z-50">
            <div className="text-sm font-medium mb-2">Select User</div>
            <div className="space-y-2">
              {users.map(user => (
                <div key={user.id} className="flex items-center gap-2 cursor-pointer" onClick={() => handleToggleUser(user.id)}>
                  <div 
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium", 
                      getColorForName(user.name)
                    )}
                  >
                    {getInitials(user.name)}
                  </div>
                  <span className="text-sm">{user.name}</span>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
      
      {/* Select user dropdown */}
      {!disabled && isAdding && (
        <div className="flex items-center space-x-1">
          <Select
            onValueChange={(value) => handleToggleUser(value)}
            onOpenChange={(open) => {
              if (!open) setIsAdding(false);
            }}
          >
            <SelectTrigger className="h-7 w-[120px]" autoFocus>
              <SelectValue placeholder="Select user" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 z-50">
              {users.map(user => (
                <SelectItem 
                  key={user.id} 
                  value={user.id}
                  className="flex items-center gap-2"
                >
                  <div className={cn(
                    "w-4 h-4 rounded-full flex items-center justify-center text-white text-xs", 
                    getColorForName(user.name)
                  )}>
                    {getInitials(user.name)}
                  </div>
                  <span>{user.name}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-6 w-6 p-0" 
            onClick={() => setIsAdding(false)}
          >
            <X size={14} />
          </Button>
        </div>
      )}
    </div>
  );
}
