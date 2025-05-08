
import { ThemeProvider } from "../context/ThemeContext";
import { TaskProvider } from "../context/TaskContext";
import { ThemeToggle } from "./ThemeToggle";
import { ProjectSidebar } from "./ProjectSidebar";
import { TaskTable } from "./TaskTable/TaskTable";
import { Timer } from "./Timer";

export function Layout() {
  return (
    <ThemeProvider>
      <TaskProvider>
        <div className="min-h-screen flex flex-col">
          <header className="border-b bg-card sticky top-0 z-20">
            <div className="container mx-auto flex items-center justify-between py-4">
              <h1 className="font-bold text-2xl tracking-tighter font-serif">VW</h1>
              <ThemeToggle />
            </div>
          </header>
          
          <div className="flex flex-1 overflow-hidden">
            <div className="h-full border-r bg-sidebar border-sidebar-border transition-all duration-200 flex-shrink-0 w-64">
              <ProjectSidebar />
            </div>
            <TaskTable />
          </div>
          
          <Timer />
        </div>
      </TaskProvider>
    </ThemeProvider>
  );
}
