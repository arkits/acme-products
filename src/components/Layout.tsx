import { Link, NavLink, useLocation } from "react-router-dom";
import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isObjectsPage = location.pathname.startsWith("/objects");
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      <header className="sticky top-0 z-30 border-b border-zinc-800 backdrop-blur bg-zinc-950/70">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold shadow-sm shadow-indigo-900/30">A</span>
            <span className="font-semibold tracking-tight">Acme Data Products</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <NavLink to="/" end className={({ isActive }) => `hover:text-white ${isActive ? "text-white" : "text-zinc-400"}`}>Browse</NavLink>
            <NavLink to="/objects" className={({ isActive }) => `hover:text-white ${isActive ? "text-white" : "text-zinc-400"}`}>Objects</NavLink>
            <NavLink to="/new" className={({ isActive }) => `hover:text-white ${isActive ? "text-white" : "text-zinc-400"}`}>New Product</NavLink>
            <NavLink to="/settings" className={({ isActive }) => `hover:text-white ${isActive ? "text-white" : "text-zinc-400"}`}>Settings</NavLink>
          </nav>
        </div>
      </header>
      <main className={`mx-auto ${isObjectsPage ? "max-w-none px-0" : "max-w-7xl px-4"} py-6`}>
        {children}
      </main>
      <footer className="mx-auto max-w-7xl px-4 pb-10 pt-8 text-xs text-zinc-500">
        © {new Date().getFullYear()} Acme Corp · Built with React + Tailwind
      </footer>
    </div>
  );
}


