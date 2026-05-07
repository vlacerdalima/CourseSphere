import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full px-6 text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">CourseSphere</h1>
          <p className="text-muted-foreground">Gestão de cursos online colaborativa</p>
        </div>
        <div className="flex flex-col gap-3">
          <Button asChild>
            <Link to="/login">Entrar</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/register">Criar conta</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
