import React, { useState, useEffect, useMemo } from 'react';
import { User } from "../../types/task";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import { Plus, X } from "lucide-react";
import { cn } from "../lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { getAuthToken } from '../../src/utils/auth';

interface AssigneeCellProps {
  assignees: number[]; // Array of numeric IDs [assignee1ID, assignee2ID, assignee3ID]
  onChange: (assignees: number[]) => void;
  disabled?: boolean;
}

interface ApiUser {
  id: number;
  name: string;
  email: string;
}

export function AssigneeCell({ assignees, onChange, disabled = false }: AssigneeCellProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [showPopover, setShowPopover] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch users from the backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          setError('No authentication token found');
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
        const formattedUsers: User[] = data.map(user => ({
          id: user.id.toString(),  // Convert number to string
          name: user.name,
          email: user.email
        }));

        setUsers(formattedUsers);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Convert numeric IDs to strings for comparison
  const assigneeIds = assignees.filter(id => id !== 0).map(id => id.toString());

  const handleToggleUser = (userId: string) => {
    const numericUserId = parseInt(userId);
    let newAssignees = [...assignees.filter(id => id !== 0)];

    if (newAssignees.includes(numericUserId)) {
      newAssignees = newAssignees.filter(id => id !== numericUserId);
    } else {
      if (newAssignees.length >= 3) return;
      newAssignees.push(numericUserId);
    }

    // Pad with zeros to maintain 3 slots
    while (newAssignees.length < 3) newAssignees.push(0);
    onChange(newAssignees);
  };

  // Remove zero values for display
  const displayAssignees = assignees.filter(id => id !== 0);
  const visibleAssignees = displayAssignees.slice(0, 3);
  const additionalCount = displayAssignees.length - 3;

  const handleRemoveUser = (userId: string) => {
    const newAssignees = assignees.filter(id => id !== parseInt(userId));
    onChange(newAssignees.length ? newAssignees : []);
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

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const query = searchQuery.toLowerCase();
    return users.filter(user => 
      user.name.toLowerCase().includes(query) || 
      user.email.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-8">Loading users...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-sm">{error}</div>;
  }

  return (
    <div className="flex flex-wrap gap-1 items-center justify-center min-h-[28px]">
      {/* Show assignee avatars */}
      {visibleAssignees.map(id => {
        const user = users.find(u => u.id.toString() === id.toString());
        if (!user) return null;

        return (
          <div
            key={id}
            className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium cursor-pointer",
              getColorForName(user.name)
            )}
            onClick={() => !disabled && handleRemoveUser(id.toString())}
            title={`${user.name} (${user.email})`}
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
              {assigneeIds.slice(3).map(id => {
                const user = users.find(u => u.id.toString() === id);
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
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate">{user.name}</div>
                      <div className="text-xs text-gray-500 truncate">{user.email}</div>
                    </div>
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
      {assigneeIds.length < 3 && !disabled && (
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
          <PopoverContent className="p-2 w-56 bg-white dark:bg-gray-800 z-50">
            <div className="space-y-2">
              <div className="text-sm font-medium mb-1">Select User</div>
              <div className="relative mb-2">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchQuery('');
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <div className="max-h-60 overflow-y-auto">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <div 
                      key={user.id} 
                      className={`flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        assigneeIds.includes(user.id) ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                      }`}
                      onClick={() => {
                        handleToggleUser(user.id.toString());
                        setSearchQuery('');
                      }}
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0",
                          getColorForName(user.name)
                        )}
                      >
                        {getInitials(user.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{user.name}</div>
                        <div className="text-xs text-gray-500 truncate">{user.email}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500 py-2 text-center">No users found</div>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
