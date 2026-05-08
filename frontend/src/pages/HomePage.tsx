import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

function DiagonalCircle({
  color,
  size,
  className,
}: {
  color: string;
  size: number;
  className?: string;
}) {
  return (
    <div
      className={`absolute rounded-full pointer-events-none ${className ?? ""}`}
      style={{
        width: size,
        height: size,
        backgroundImage: `repeating-linear-gradient(45deg, ${color} 0, ${color} 1px, transparent 0, transparent 50%)`,
        backgroundSize: "8px 8px",
      }}
    />
  );
}

export function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-white flex flex-col overflow-x-hidden">
      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-6 md:px-14 py-5">
        <Link to="/" className="text-xl font-bold tracking-tight select-none">
          <span className="text-gray-900">Course</span>
          <span className="text-blue-600">Sphere</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-gray-500">
          <Link to="/explore" className="hover:text-gray-900 transition-colors font-medium">
            Explorar
          </Link>
          {["Para alunos", "Para instrutores", "Comunidade"].map((label) => (
            <a
              key={label}
              href="#"
              onClick={(e) => e.preventDefault()}
              className="hover:text-gray-900 transition-colors"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <Button asChild>
              <Link to="/courses">Ir pro dashboard</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/login">Entrar</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Criar conta</Link>
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 relative flex flex-col items-center justify-center text-center px-6 py-24 overflow-hidden">
        <DiagonalCircle color="#a5b4fc" size={300} className="-top-24 -left-24 opacity-50" />
        <DiagonalCircle color="#bfdbfe" size={220} className="top-1/3 -right-20 opacity-40" />
        <DiagonalCircle color="#fde68a" size={180} className="bottom-16 left-[15%] opacity-50" />
        <DiagonalCircle color="#c4b5fd" size={140} className="-bottom-12 right-1/3 opacity-40" />

        {/* Badge */}
        <div className="relative z-10 inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-medium px-4 py-1.5 rounded-full mb-8 border border-blue-100 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          Novo · 1.200+ cursos atualizados em 2026
        </div>

        {/* Title */}
        <h1 className="relative z-10 text-4xl md:text-6xl font-bold tracking-tight text-gray-900 max-w-2xl mb-6 leading-tight">
          Aprenda. Ensine.{" "}
          <span className="text-blue-600 underline decoration-blue-300 underline-offset-8">
            Cresça em órbita.
          </span>
        </h1>

        {/* Description */}
        <p className="relative z-10 text-lg text-gray-500 max-w-lg mb-10 leading-relaxed">
          Acesse centenas de cursos criados por especialistas, aprenda no seu ritmo e
          construa a carreira que você quer.
        </p>

        {/* CTAs */}
        <div className="relative z-10 flex flex-col sm:flex-row gap-3 mb-14 w-full max-w-xs sm:max-w-none sm:w-auto">
          <Button size="lg" className="w-full sm:w-auto" asChild>
            <Link to="/register">Começar grátis →</Link>
          </Button>
          <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
            <Link to="/register">Quero ensinar</Link>
          </Button>
        </div>

        {/* Social proof */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex -space-x-2">
            {[11, 12, 13, 14, 15].map((n) => (
              <img
                key={n}
                src={`https://i.pravatar.cc/40?img=${n}`}
                alt=""
                className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
              />
            ))}
          </div>
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-900">+38 mil</span>{" "}
            alunos aprenderam algo novo esta semana
          </p>
        </div>

        {/* Player card */}
        <div className="absolute right-12 xl:right-28 top-1/2 -translate-y-1/2 hidden lg:block z-10">
          <div className="bg-white rounded-2xl shadow-xl p-5 w-52 border border-gray-100">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-200">
              <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <div className="bg-blue-50 text-blue-700 text-xs rounded-xl px-3 py-2 text-center leading-relaxed">
              Aula concluída · +10 XP<br />sequência de 5 dias
            </div>
          </div>
        </div>

        {/* Progress card */}
        <div className="absolute left-12 xl:left-28 top-1/2 -translate-y-1/2 hidden lg:block z-10">
          <div className="bg-white rounded-2xl shadow-xl p-5 w-48 border border-gray-100">
            <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">Progresso</p>
            <p className="text-3xl font-bold text-gray-900 mb-3">62%</p>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: "62%" }} />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-6 md:px-14">
        <p className="text-xs text-gray-400 uppercase tracking-widest text-center mb-5 font-medium">
          Times que aprendem aqui
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {["ORBITAL", "NEXUS", "LUMEN.IO", "PIVOT/FACTORY", "HALO", "APRIORI"].map((name) => (
            <span key={name} className="text-gray-300 font-bold text-sm tracking-widest">
              {name}
            </span>
          ))}
        </div>
      </footer>
    </div>
  );
}
