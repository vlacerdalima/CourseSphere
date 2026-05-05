// Layout for unauthenticated routes (login, register). Renders without the main navigation.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
