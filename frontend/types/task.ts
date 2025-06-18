export type Priority = "urgent" | "high" | "normal" | "low" | "none";
export type Status =
  | "todo"
  | "inprogress"
  | "complete"
  | "review"
  | "closed"
  | "backlog"
  | "clarification";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface TimeEstimate {
  hours: number;
  minutes: number;
}

export interface Comment {
  id: string;
  userId: number; // Changed from userID to userId to match backend
  text: string;
  createdAt: string;
}

export interface SubactionItem {
  id: string;
  name: string;
  assignee: string[] | null;
  dueDate: Date | null;
  priority: Priority;
  status: Status;
  comments: Comment[];
  estimatedTime: TimeEstimate | null;
  timeSpent: number; // in minutes
  level1ID: number;
  level2ID: number;
  level3ID: number;
  level4ID: number;
  assignee1ID?: number;
  assignee2ID?: number;
  assignee3ID?: number;
  taskType: TaskType;
  description?: string;
  estHours?: number;
  estPrevHours?: number | null;
  actHours?: number;
}

export interface ActionItem {
  id: string;
  name: string;
  assignee: string[] | null;
  dueDate: Date | null;
  priority: Priority;
  status: Status;
  taskType: TaskType;
  comments: Comment[];
  estimatedTime: TimeEstimate | null;
  timeSpent: number; // in minutes
  expanded: boolean;
  subactionItems: SubactionItem[];
  level1ID: number;
  level2ID: number;
  level3ID: number;
  level4ID: number;
  assignee1ID?: number;
  assignee2ID?: number;
  assignee3ID?: number;
  description?: string;
  estHours?: number;
  estPrevHours?: number | null;
  actHours?: number;
}

export interface Subtask {
  id: string;
  name: string;
  assignee: string[] | null;
  dueDate: Date | null;
  priority: Priority;
  status: Status;
  taskType: TaskType;
  comments: Comment[];
  estimatedTime: TimeEstimate | null;
  timeSpent: number; // in minutes
  expanded: boolean;
  actionItems: ActionItem[];
  level1ID: number;
  level2ID: number;
  level3ID: number;
  level4ID: number;
  assignee1ID?: number;
  assignee2ID?: number;
  assignee3ID?: number;
  description?: string;
  estHours?: number;
  estPrevHours?: number | null;
  actHours?: number;
}

export type TaskType = 'task' | 'milestone' | 'forms';

export interface Task {
  id: string;
  name: string;
  assignee: string[] | null;
  dueDate: Date | null;
  priority: Priority;
  status: Status;
  taskType: TaskType;
  estimatedTime: TimeEstimate | null;
  timeSpent: number; // in minutes
  expanded: boolean;
  subtasks: Subtask[];
  level1ID: number;
  level2ID: number;
  level3ID: number;
  level4ID: number;
  description?: string;
  assignee1ID?: number;
  assignee2ID?: number;
  assignee3ID?: number;
  wsID?: number;
  userID?: number;
  projectID?: number;
  taskLevel?: number;
  parentID?: number;
  estHours?: number;
  estPrevHours?: number | null;
  actHours?: number;
  isExceeded?: number;
  info?: Record<string, any>;
  comments?: Comment[]; // Stored as JSON string in database, but contains Comment[] when parsed
  subtaskCount?: number;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  tasks: Task[];
  userID?: number;
  wsID?: number;
  estHours?: number;
  actHours?: number;
  startDate?: Date;
  endDate?: Date;
  createdAt?: Date;
  modifiedAt?: Date;
  expandedState?: {
    tasks: Set<string>;
    subtasks: Set<string>;
    actionItems: Set<string>;
  };
  members: number[];
}

export interface TimerInfo {
  projectId: string | null;
  taskId: string | null;
  subtaskId: string | null;
  actionItemId: string | null;
  subactionItemId: string | null;
  startTime: Date | null;
  isRunning: boolean;
  isActive: boolean;
}
