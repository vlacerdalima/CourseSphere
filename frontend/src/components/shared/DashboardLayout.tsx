import { useState } from "react";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sidebar } from "./Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  onCreateCourse?: () => void;
}

export function DashboardLayout({ children, onCreateCourse = () => {} }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar fixa em desktop */}
      <div className="hidden lg:block">
        <Sidebar onCreateCourse={onCreateCourse} />
      </div>

      {/* Backdrop do drawer em mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Drawer em mobile */}
      <div
        className={cn(
          "fixed top-0 left-0 h-dvh z-50 w-64 transform transition-transform duration-200 lg:hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar
          onCreateCourse={onCreateCourse}
          onNavigate={() => setSidebarOpen(false)}
        />
      </div>

      {/* Área principal */}
      <main className="flex-1 overflow-y-auto">
        {/* Barra superior com hambúrguer em mobile */}
        <div className="sticky top-0 z-30 flex items-center gap-4 border-b bg-background p-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="font-semibold">CourseSphere</span>
        </div>
        {children}
      </main>
    </div>
  );
}
