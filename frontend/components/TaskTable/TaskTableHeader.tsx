import { Button } from "../ui/button";
import { MinusIcon, PlusIcon, Plus, MoreHorizontal } from "lucide-react";
import { cn } from "../lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Textarea } from "../ui/textarea";
import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import { addDays, format, parseISO } from "date-fns";
import { useTaskContext } from "../../context/TaskContext";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
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

  // In TaskTableHeader.tsx
  useEffect(() => {
    setDescription(projectDescription || "");
    setSavedDescription(projectDescription || "");

    // Handle both string and Date objects for dates
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
    // Set all users without filtering out the current user
    setAvailableUsers(users);
    if (users.length > 0) {
      // Set the first user as selected by default
      setSelectedUserIds([users[0].id.toString()]); // Ensure it's a string
    }
  }, [users]);
  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://vw.aisrv.in/new_backend/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      console.log('Fetched users:', data); // Debug log
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
  // In TaskTableHeader.tsx, modify the handleSendInvitation function:
  const handleSendInvitation = async () => {
    if (selectedUserIds.length === 0) {
      toast.error("Please select at least one user to invite");
      return;
    }

    if (users.length === 0) {
      toast.error("User list is not loaded yet. Please wait...");
      await fetchUsers(); // Try to fetch users again
      return;
    }

    console.log('Debug - Selected User IDs:', selectedUserIds);
    console.log('Debug - All Users:', users);
    // Debug log
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');

      console.log('Debug - Selected User IDs:', selectedUserIds);
      console.log('Debug - All Users:', users);
      console.log('Debug - Selected User IDs Type:', typeof selectedUserIds[0]);
      console.log('Debug - User IDs Type in users array:', users.map(u => ({
        id: u.id,
        type: typeof u.id,
        email: u.email
      })));

      // Get the selected users' emails
      const selectedUsers = users.filter(user => {
        const isIncluded = selectedUserIds.includes(user.id);
        console.log(`Checking user ${user.id} (${user.email}):`, isIncluded);
        return isIncluded;
      });

      console.log('Debug - Selected Users:', selectedUsers);

      if (selectedUsers.length === 0) {
        console.error('No users matched the selected IDs. This could be due to type mismatch or missing users.');
        throw new Error('No valid users selected. Please try refreshing the page and try again.');
      }

      const emails = selectedUsers.map(user => user.email).filter(Boolean);
      console.log('Debug - Extracted Emails:', emails);

      if (emails.length === 0) {
        throw new Error('No valid email addresses found for selected users');
      }

      const emailString = emails.join(',');
      console.log('Debug - Final Email String:', emailString);

      const response = await fetch('https://vw.aisrv.in/new_backend/send-invitation', {
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
      console.log('Response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to send invitations');
      }

      toast.success('Invitations sent successfully!');
    } catch (error) {
      console.error('Error sending invitations:', error);
      toast.error(error.message || 'Failed to send invitations');
    } finally {
      setIsLoading(false);
    }
  };
  const handleInviteUsers = async () => {
    if (selectedUserIds.length === 0) return;

    try {
      const token = localStorage.getItem('token');

      for (const userId of selectedUserIds) {
        const response = await fetch(`https://vw.aisrv.in/new_backend/projects/${projectId}/invite`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ userId })
        });

        if (!response.ok) {
          throw new Error(`Failed to invite user with ID: ${userId}`);
        }
      }

      toast.success('Users invited successfully');
      setSelectedUserIds([]); // reset after invite

    } catch (error) {
      console.error('Error inviting users:', error);
      toast.error('Failed to invite some users');
    }
  };

  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date);
    if (date && endDate && date > endDate) {
      setEndDate(date); // Set end date to start date if it's before
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
        projectName, // Keep the existing name
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
      <div className="px-2 py-1.5 max-h-64 overflow-y-auto">
        {availableUsers.map((user) => (
          <div key={user.id} className="flex items-center space-x-2 p-2 hover:bg-gray-100">
            <input
              type="checkbox"
              id={`user-${user.id}`}
              checked={selectedUserIds.includes(user.id)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedUserIds([...selectedUserIds, user.id]);
                } else {
                  setSelectedUserIds(selectedUserIds.filter(id => id !== user.id));
                }
              }}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label
              htmlFor={`user-${user.id}`}
              className="ml-2 text-sm font-medium text-gray-700 cursor-pointer"
            >
              {user.name}
              {/* Only show email if it exists */}
              {user.email && ` (${user.email})`}
            </label>
          </div>
        ))}

        <Button
          onClick={handleSendInvitation}
          disabled={isLoading || selectedUserIds.length === 0}
          className="ml-2"
        >
          {isLoading ? 'Sending...' : 'Send Invitation'}
        </Button>
      </div>

    </div>

  );
}
