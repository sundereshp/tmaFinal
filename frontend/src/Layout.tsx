import { ThemeProvider } from "../context/ThemeContext";
import { TaskProvider } from "../context/TaskContext";
import { ThemeToggle } from "./ThemeToggle";
import { ProjectSidebar } from "./ProjectSidebar";
import { TaskTable } from "../components/TaskTable/TaskTable";
import { Timer } from "./Timer";
import { getCurrentUser } from "./utils/auth";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/ui/dropdown-menu";

export function Layout() {
  const user = getCurrentUser();
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <ThemeProvider>
      <TaskProvider>
        <div className="min-h-screen flex flex-col relative">
          <header className="border-b bg-card fixed top-0 right-0 left-64 z-20">
            <div className="flex items-center justify-end py-4 pr-4">
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium hover:opacity-80 transition-opacity">
                      {userInitial}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 p-2">
                    <div className="px-2 py-1.5">
                      <p className="font-medium">{user?.name || 'User'}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email || ''}</p>
                    </div>
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer mt-1"
                      onClick={() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        window.location.href = '/sunderesh/#/login';
                      }}
                    >
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          <div className="flex flex-1 overflow-hidden pt-16">
            <div className="h-screen fixed top-0 left-0 border-r bg-sidebar border-sidebar-border w-64">
              <ProjectSidebar />
            </div>
            <div className="flex-1 ml-64 overflow-auto">
              <TaskTable />
            </div>
          </div>

          <Timer />
        </div>
      </TaskProvider>
    </ThemeProvider>
  );
}
