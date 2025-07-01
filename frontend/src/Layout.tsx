import { ThemeProvider } from "../context/ThemeContext";
import { TaskProvider } from "../context/TaskContext";
import { ThemeToggle } from "./ThemeToggle";
import { ProjectSidebar } from "./ProjectSidebar";
import { TaskTable } from "../components/TaskTable/TaskTable";
import { Timer } from "./Timer";
import { getCurrentUser } from "./utils/auth";
import Logo from "../source/assets/images/Final.png";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/ui/dropdown-menu";

export function Layout() {
  const user = getCurrentUser();
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <ThemeProvider>
      <TaskProvider>
        <div className="min-h-screen flex flex-col">
          <header className="border-b bg-card sticky top-0 z-20">
            <div className="containerheader flex items-center justify-between py-4 pr-4 ml-12 mr-4">
              <div className="flex items-center gap-8">
                <div className="flex items-center justify-center h-8">
                  <img
                    src={Logo}
                    alt="Logo"
                    className="logo flex items-center justify-center h-8"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium hover:opacity-80 transition-opacity">
                      {userInitial}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56 p-2">
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

              <div className="flex items-center gap-4">
                <ThemeToggle />
              </div>
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
