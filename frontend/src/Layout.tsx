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
        <div className="min-h-screen relative">
          {/* Header */}
          <header className="border-b bg-card fixed top-0 left-64 right-0 z-20 h-16">
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

          {/* Project Sidebar - absolutely positioned */}
          <div className="fixed top-0 left-0 w-64 h-screen border-r bg-sidebar border-sidebar-border z-30">
            <ProjectSidebar />
          </div>

          {/* Main Content */}
          <main className="ml-64 pt-16 h-screen overflow-auto">
            <TaskTable />
          </main>

          {/* Timer always at bottom */}
          <Timer />
        </div>
      </TaskProvider>
    </ThemeProvider>
  );
}
