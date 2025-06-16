import { useState } from "react";
import { Check, FileText, Milestone, ListTodo, CircleDashed, CircleDot,CircleCheckBig,FileQuestion,CircleX,Bookmark,Archive } from "lucide-react";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { cn } from "../lib/utils";
import { TaskType, Status } from "../../types/task";
import * as React from "react";

interface TaskTypeDropdownProps {
    taskType: TaskType;
    status: Status;
    onTypeChange: (type: TaskType) => void;
    onStatusChange: (status: Status) => void;
}

type TaskTypeOption = {
    value: TaskType;
    label: string;
    icon: React.ReactElement;
};

type StatusOption = {
    value: Status;
    label: string;
    icon: React.ReactElement;
};

const statusColors = {
    todo: "text-gray-500 dark:text-gray-300",
    inprogress: "text-blue-500 dark:text-blue-400",
    complete: "text-green-500 dark:text-green-400",
    review: "text-violet-500 dark:text-violet-400",
    closed: "text-rose-500 dark:text-rose-400",
    backlog: "text-orange-500 dark:text-amber-400",
    clarification: "text-amber-500 dark:text-amber-400"
} as const;

type StatusColor = keyof typeof statusColors;

const taskTypeOptions: TaskTypeOption[] = [
    {
        value: "task",
        label: "Task",
        icon: <ListTodo className="h-4 w-4" />,
    },
    {
        value: "milestone",
        label: "Milestone",
        icon: <Milestone className="h-4 w-4" />,
    },
    {
        value: "forms",
        label: "Forms",
        icon: <FileText className="h-4 w-4" />,
    },
];

const statusOptions: StatusOption[] = [
    { value: "todo", label: "To Do", icon: <CircleDashed className="h-3 w-3" /> },
    { value: "inprogress", label: "In Progress", icon: <CircleDot className="h-3 w-3" /> },
    { value: "complete", label: "Complete", icon: <CircleCheckBig className="h-3 w-3" /> },
    { value: "review", label: "Review", icon: <Bookmark className="h-3 w-3" /> },
    { value: "closed", label: "Closed", icon: <CircleX className="h-3 w-3" /> },
    { value: "backlog", label: "Backlog", icon: <Archive className="h-3 w-3" /> },
    { value: "clarification", label: "Clarification", icon: <FileQuestion className="h-3 w-3" /> },
];

export function TaskTypeDropdown({
    taskType,
    status,
    onTypeChange,
    onStatusChange
}: TaskTypeDropdownProps) {
    const [open, setOpen] = useState(false);
    const selectedType = taskTypeOptions.find(opt => opt.value === taskType) || taskTypeOptions[0];
    const selectedStatus = statusOptions.find(opt => opt.value === status) || statusOptions[0];

    return (
        // In TaskTypeDropdown.tsx
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                            "h-6 w-6 p-0 hover:bg-transparent hover:text-foreground",
                            statusColors[status as StatusColor],
                            "transition-colors duration-200"
                        )}
                        title={`${selectedType.label} - ${selectedStatus.label}`}
                    >
                        {React.cloneElement(selectedType.icon, {
                            className: cn("h-4 w-4", statusColors[status as StatusColor])
                        })}
                    </Button>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-auto p-0 overflow-hidden">
                <div className="flex">
                    {/* Task Type Section - Left */}
                    <div className="w-40 border-r">
                        <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b">
                            Task Type
                        </div>
                        <div className="py-1">
                            {taskTypeOptions.map((option) => (
                                <DropdownMenuItem
                                    key={option.value}
                                    onClick={() => {
                                        onTypeChange(option.value);
                                        setOpen(false);
                                    }}
                                    className="flex items-center justify-between px-3 py-2"
                                >
                                    <div className="flex items-center gap-2">
                                        {option.icon}
                                        <span>{option.label}</span>
                                    </div>
                                    {taskType === option.value && <Check className="h-4 w-4" />}
                                </DropdownMenuItem>
                            ))}
                        </div>
                    </div>

                    {/* Status Section - Right */}
                    <div className="w-40">
                        <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b">
                            Status
                        </div>
                        <div className="py-1">
                            {statusOptions.map((option) => (
                                <DropdownMenuItem
                                    key={option.value}
                                    onClick={() => {
                                        onStatusChange(option.value);
                                        setOpen(false);
                                    }}
                                    className="flex items-center justify-between px-3 py-2"
                                >
                                    <div className="flex items-center gap-2">
                                        {React.cloneElement(option.icon, {
                                            className: cn("h-3 w-3", statusColors[option.value as StatusColor])
                                        })}
                                        <span>{option.label}</span>
                                    </div>
                                    {status === option.value && <Check className="h-4 w-4" />}
                                </DropdownMenuItem>
                            ))}
                        </div>
                    </div>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}