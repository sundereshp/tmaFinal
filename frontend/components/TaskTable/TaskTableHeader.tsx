import { Button } from "../ui/button";
import { MinusIcon, PlusIcon, Plus, MoreHorizontal, ChevronDown } from "lucide-react";
import { cn } from "../lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Textarea } from "../ui/textarea";
import { useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import { addDays, format, parseISO } from "date-fns";
import { useTaskContext } from "../../context/TaskContext";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import React from "react";
interface User {
  id: string;
  name: string;
  email: string;
}

interface TaskTableHeaderProps {
  projectName: string;
  projectId: string;
  projectDescription?: string;
  projectStartDate?: string;
  projectEndDate?: string;
  projectEstHours?: number;
  projectActHours?: number;
  timer: {
    isRunning: boolean;
    projectId: string | null;
    startTime: Date | null;
  };
  selectedProjectId: string | null;
  onStopTimer: () => void;
  totalEstimatedTime: number;
}

export function TaskTableHeader({
  projectName,
  projectId,
  projectDescription,
  projectStartDate,
  projectEndDate,
  projectEstHours,
  projectActHours,
  timer,
  selectedProjectId,
  onStopTimer,
  totalEstimatedTime
}: TaskTableHeaderProps) {
  const [description, setDescription] = useState("");
  const [savedDescription, setSavedDescription] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const isTimerActiveForProject = timer.isRunning && timer.projectId === selectedProjectId;
  const { updateProject } = useTaskContext();
  const [estHours, setEstHours] = useState(projectEstHours || 0);
  const [actHours, setActHours] = useState(projectActHours || 0);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter users based on search query
  const filteredUsers = searchQuery.trim() === ''
    ? availableUsers
    : availableUsers.filter((user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleUser = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      setSelectedUserIds(selectedUserIds.filter((id) => id !== userId));
    } else {
      setSelectedUserIds([...selectedUserIds, userId]);
    }
  };

  useEffect(() => {
    setDescription(projectDescription || "");
    setSavedDescription(projectDescription || "");

    setStartDate(projectStartDate ?
      (typeof projectStartDate === 'string' ?
        parseISO(projectStartDate) :
        new Date(projectStartDate)
      ) : null
    );

    setEndDate(projectEndDate ?
      (typeof projectEndDate === 'string' ?
        parseISO(projectEndDate) :
        new Date(projectEndDate)
      ) : null
    );

    setEstHours(projectEstHours || 0);
    setActHours(projectActHours || 0);
  }, [projectDescription, projectStartDate, projectEndDate, projectEstHours, projectActHours]);

  useEffect(() => {
    setAvailableUsers(users);
  }, [users]);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://vw.aisrv.in/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      console.log('Fetched users:', data);
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users');
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSendInvitation = async () => {
    if (selectedUserIds.length === 0) {
      toast.error("Please select at least one user to invite");
      return;
    }

    if (users.length === 0) {
      toast.error("User list is not loaded yet. Please wait...");
      await fetchUsers();
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');

      const selectedUsers = users.filter(user =>
        selectedUserIds.includes(user.id)
      );

      if (selectedUsers.length === 0) {
        throw new Error('No valid users selected. Please try refreshing the page and try again.');
      }

      const emails = selectedUsers.map(user => user.email).filter(Boolean);

      if (emails.length === 0) {
        throw new Error('No valid email addresses found for selected users');
      }

      const emailString = emails.join(',');

      const response = await fetch('http://vw.aisrv.in/send-invitation', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectId,
          projectName,
          emails: emailString
        })
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to send invitations');
      }

      toast.success('Invitations sent successfully!');
      
      setSelectedUserIds([]);
      setSearchQuery(''); // Clear selection after successful send
      setIsUserDropdownOpen(false); // Close dropdown
    } catch (error) {
      console.error('Error sending invitations:', error);
      toast.error(error.message || 'Failed to send invitations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date);
    if (date && endDate && date > endDate) {
      setEndDate(date);
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    if (date && startDate && date < startDate) return;
    setEndDate(date);
  };

  const handleSaveDescription = async () => {
    try {
      await updateProject(
        projectId,
        projectName,
        description,
        startDate ? startDate.toISOString() : new Date().toISOString(),
        endDate ? endDate.toISOString() : addDays(new Date(), 30).toISOString(),
        estHours,
        actHours
      );
      setSavedDescription(description);
      setIsDropdownOpen(false);
      toast.success("Project updated successfully");
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error("Failed to update project");
    }
  };

  const formatTime = (time: number) => {
    const hours = Math.floor(time);
    const minutes = Math.round((time - hours) * 60);
    return `${hours}h ${minutes}m`.replace(/ 0m$/, "");
  };

  
  return (
    <div className="mb-4 flex items-center justify-between sticky top-0 bg-background z-10 px-8 py-3">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold mr-4">{projectName}</h1>
        {totalEstimatedTime > 0 && (
          <span className="text-muted-foreground ml-2 text-lg">
            ({formatTime(totalEstimatedTime)})
          </span>
        )}

        <div className="flex items-center space-x-1 bg-muted/50 rounded-md p-1">
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-3 w-72 max-h-96 overflow-auto space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Project Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter project description..."
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Start Date</label>
                <DatePicker
                  selected={startDate}
                  onChange={handleStartDateChange}
                  placeholderText="Pick a start date"
                  className="w-full border px-2 py-1 rounded text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  calendarClassName="dark:bg-gray-800 dark:text-white"
                  dayClassName={(date) =>
                    startDate && date.getDate() === startDate.getDate() && date.getMonth() === startDate.getMonth()
                      ? 'dark:bg-blue-600 dark:text-white'
                      : 'dark:text-white'
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">End Date</label>
                <DatePicker
                  selected={endDate}
                  onChange={handleEndDateChange}
                  placeholderText="Pick an end date"
                  className="w-full border px-2 py-1 rounded text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  calendarClassName="dark:bg-gray-800 dark:text-white"
                  dayClassName={(date) =>
                    endDate && date.getDate() === endDate.getDate() && date.getMonth() === endDate.getMonth()
                      ? 'dark:bg-blue-600 dark:text-white'
                      : 'dark:text-white'
                  }
                  minDate={startDate || undefined}
                />
              </div>

              <Button size="sm" className="w-full mt-2" onClick={handleSaveDescription}>
                Save
              </Button>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isTimerActiveForProject && (
        <div className="flex items-center space-x-4">
          <div className="text-sm">
            <span className="timer-active font-medium">Timer running: </span>
            <span>{format(timer.startTime!, "HH:mm:ss")}</span>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={onStopTimer}
          >
            Stop Timer
          </Button>
        </div>
      )}

      {/* Improved User Selection Component */}
      <div className="w-full max-w-md" ref={dropdownRef}>
        <div className="relative">
          {/* Main Input Field */}
          <div
            className="w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 cursor-pointer bg-white"
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
          >
            <div className="flex flex-wrap gap-1">
              {selectedUserIds.length > 0 ? (
                users
                  .filter(user => selectedUserIds.includes(user.id))
                  .map(user => (
                    <span
                      key={user.id}
                      className="inline-flex items-center px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full"
                    >
                      {user.name}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleUser(user.id);
                        }}
                        className="ml-1.5 text-indigo-600 hover:text-indigo-900"
                      >
                        ×
                      </button>
                    </span>
                  ))
              ) : (
                <span className="text-gray-700 text-sm">
                  Select users...
                </span>
              )}
            </div>
            <ChevronDown 
              className={`h-4 w-4 text-gray-500 transition-transform absolute right-2 top-1/2 -translate-y-1/2 ${
                isUserDropdownOpen ? 'rotate-180' : ''
              }`} 
            />
          </div>

          {/* Dropdown */}
          {isUserDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-80 overflow-hidden">
              {/* Search Input */}
              <div className="p-3 border-b border-gray-200 bg-gray-50">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users by name or email..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  autoFocus
                />
              </div>

              {/* User List */}
              <div className="max-h-60 overflow-y-auto">
                {isLoading ? (
                  <div className="p-4 text-sm text-gray-500 text-center">
                    Loading users...
                  </div>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      onClick={() => toggleUser(user.id)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedUserIds.includes(user.id)}
                        onChange={() => {}} // Controlled by parent click
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mr-3"
                        tabIndex={-1}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {user.name}
                        </div>
                        {user.email && (
                          <div className="text-xs text-gray-500 truncate">
                            {user.email}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-sm text-gray-500 text-center">
                    {searchQuery ? 'No users found matching your search' : 'No users available'}
                  </div>
                )}
              </div>

              {/* Selected Count Footer */}
              {selectedUserIds.length > 0 && (
                <div className="p-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
                  {selectedUserIds.length} user{selectedUserIds.length !== 1 ? 's' : ''} selected
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-3 flex gap-2">
          <button
            onClick={handleSendInvitation}
            disabled={isLoading || selectedUserIds.length === 0}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors text-sm"
          >
            {isLoading ? 'Sending...' : `Send Invitation${selectedUserIds.length !== 1 ? 's' : ''}`}
          </button>
          
          {selectedUserIds.length > 0 && (
            <button
              onClick={() => {
                setSelectedUserIds([]);
                setSearchQuery('');
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm"
            >
              Clear All
            </button>
          )}
        </div>
      </div>
    </div>
  );
}