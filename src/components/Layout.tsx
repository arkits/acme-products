import { Link, NavLink, useLocation } from "react-router-dom";
import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isObjectsPage = location.pathname.startsWith("/objects");
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 glass-strong">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-sky-500 to-emerald-500 text-white font-bold shadow-sm">A</span>
            <span className="font-semibold tracking-tight">Acme Data Products</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <NavLink to="/" end className={({ isActive }) => `${isActive ? "text-white" : "text-zinc-400 hover:text-zinc-200"}`}>Data Products</NavLink>
            <NavLink to="/objects" className={({ isActive }) => `${isActive ? "text-white" : "text-zinc-400 hover:text-zinc-200"}`}>Data Dictionary</NavLink>
            <NavLink to="/settings" className={({ isActive }) => `${isActive ? "text-white" : "text-zinc-400 hover:text-zinc-200"}`}>Settings</NavLink>
          </nav>
        </div>
      </header>
      <main className={`mx-auto ${isObjectsPage ? "max-w-none px-0" : "max-w-7xl px-4"} py-6`}>
        {children}
      </main>
      {/* Footer removed as requested */}
    </div>
  );
}


