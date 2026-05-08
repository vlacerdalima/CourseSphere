import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Compass, Plus, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

interface SidebarProps {
  onCreateCourse?: () => void;
  onNavigate?: () => void;
}

export function Sidebar({ onCreateCourse, onNavigate }: SidebarProps) {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();

  const navLinks = [
    { to: "/courses", label: "Meus cursos", icon: LayoutDashboard },
    { to: "/explore", label: "Explorar", icon: Compass },
  ];

  return (
    <aside className="flex flex-col w-60 shrink-0 h-screen bg-white border-r border-gray-100">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <Link to="/courses" onClick={onNavigate} className="text-lg font-bold tracking-tight select-none">
          <span className="text-gray-900">Course</span>
          <span className="text-blue-600">Sphere</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
        {navLinks.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}

        {/* Create course CTA */}
        <div className="mt-4 rounded-xl bg-gray-50 border border-gray-100 p-4">
          <p className="text-xs font-semibold text-gray-700 mb-1">Criar novo curso</p>
          <p className="text-xs text-gray-400 mb-3 leading-relaxed">
            Compartilhe seu conhecimento com a comunidade.
          </p>
          <Button size="sm" className="w-full gap-1.5" onClick={onCreateCourse}>
            <Plus className="w-3.5 h-3.5" />
            Criar curso
          </Button>
        </div>
      </nav>

      {/* User + logout */}
      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold shrink-0">
              {user?.name?.[0]?.toUpperCase() ?? "U"}
            </div>
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
          </div>
          <button
            onClick={() => { onNavigate?.(); logout(); }}
            title="Sair"
            className="text-gray-400 hover:text-gray-700 transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
