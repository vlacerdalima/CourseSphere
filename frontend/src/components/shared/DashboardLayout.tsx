import { Sidebar } from "./Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  onCreateCourse?: () => void;
}

export function DashboardLayout({ children, onCreateCourse = () => {} }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar onCreateCourse={onCreateCourse} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
