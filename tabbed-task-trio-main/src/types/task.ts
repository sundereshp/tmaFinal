export type Priority = "urgent" | "high" | "normal" | "low" | "none";
export type Status = "todo" | "inprogress" | "done";

export interface User {
  id: string;
  name: string;
  avatar?: string;
}

export interface TimeEstimate {
  hours: number;
  minutes: number;
}

export interface SubactionItem {
  id: string;
  name: string;
  assignee: string[] | null;
  dueDate: Date | null;
  priority: Priority;
  status: Status;
  comments: string;
  estimatedTime: TimeEstimate | null;
  timeSpent: number; // in minutes
}

export interface ActionItem {
  id: string;
  name: string;
  assignee: string[] | null;
  dueDate: Date | null;
  priority: Priority;
  status: Status;
  comments: string;
  estimatedTime: TimeEstimate | null;
  timeSpent: number; // in minutes
  expanded: boolean;
  subactionItems: SubactionItem[];
}

export interface Subtask {
  id: string;
  name: string;
  assignee: string[] | null;
  dueDate: Date | null;
  priority: Priority;
  status: Status;
  comments: string;
  estimatedTime: TimeEstimate | null;
  timeSpent: number; // in minutes
  expanded: boolean;
  actionItems: ActionItem[];
}

export interface Task {
  id: string;
  name: string;
  assignee: string[] | null;
  dueDate: Date | null;
  priority: Priority;
  status: Status;
  comments: string;
  estimatedTime: TimeEstimate | null;
  timeSpent: number; // in minutes
  expanded: boolean;
  subtasks: Subtask[];
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
}

export interface TimerInfo {
  projectId: string | null;
  actionItemId: string | null;
  startTime: Date | null;
  isRunning: boolean;
}
