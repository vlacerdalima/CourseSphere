import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface PublicOnlyRouteProps {
  children: React.ReactNode;
}

export function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/courses" replace />;
  }

  return <>{children}</>;
}
