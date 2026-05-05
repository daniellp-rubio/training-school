"use client";

import { useApp, useCurrentUser } from "@/lib/store";
import { Bell, Search, ChevronDown, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Logo from "./logo";

const roleColor = {
  admin: "from-accent to-accent-dim",
  cajero: "from-blue-400 to-cyan-500",
  entrenador: "from-fuchsia-400 to-purple-500",
};

const roleLabel = {
  admin: "Administrador",
  cajero: "Cajero",
  entrenador: "Entrenador",
};

export default function Topbar() {
  const router = useRouter();
  const user = useCurrentUser();
  const users = useApp((s) => s.users);
  const setUser = useApp((s) => s.setUser);
  const logout = useApp((s) => s.logout);
  const products = useApp((s) => s.products);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const lowStock = products.filter((p) => p.stock <= p.minStock).length;

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/70 backdrop-blur-xl">
      <div className="px-6 lg:px-10 h-16 flex items-center gap-4">
        <div className="lg:hidden">
          <Logo />
        </div>
        <div className="flex-1 max-w-xl ml-auto lg:ml-0">
          <div className="relative">
            <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
            <label htmlFor="topbar-search" className="sr-only">Buscar</label>
            <input
              id="topbar-search"
              type="search"
              className="input w-full pl-9 hidden md:block"
              placeholder="Buscar productos, ventas, usuarios…"
            />
          </div>
        </div>
        <button
          type="button"
          aria-label={`Notificaciones: ${lowStock} productos en stock crítico`}
          className="relative w-10 h-10 rounded-xl bg-white/5 border border-border flex items-center justify-center hover:bg-white/10 transition"
        >
          <Bell aria-hidden="true" className="w-4 h-4 text-ink-dim" />
          {lowStock > 0 && (
            <span aria-hidden="true" className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center">
              {lowStock}
            </span>
          )}
        </button>
        <div className="relative" ref={ref}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={open}
            aria-label={`Cambiar de usuario. Activo: ${user?.name ?? "—"}`}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl bg-white/5 border border-border hover:bg-white/10 transition"
          >
            <div
              className={`w-7 h-7 rounded-lg bg-gradient-to-br ${roleColor[user?.role ?? "admin"]} flex items-center justify-center text-white text-xs font-bold`}
            >
              {(user?.name ?? "").split(" ").map((p) => p[0]).slice(0, 2).join("")}
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <div className="text-xs font-semibold">{user?.name}</div>
              <div className="text-[10px] text-ink-muted uppercase tracking-wider">
                {roleLabel[user?.role ?? "admin"]}
              </div>
            </div>
            <ChevronDown aria-hidden="true" className="w-3.5 h-3.5 text-ink-muted" />
          </button>
          {open && (
            <div role="menu" aria-label="Cambiar de usuario" className="absolute right-0 mt-2 w-72 glass-strong p-2 z-50">
              <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-ink-muted">
                Cambiar de usuario (demo)
              </div>
              {users.filter((u) => u.active).map((u) => (
                <button
                  key={u.id}
                  type="button"
                  role="menuitem"
                  aria-current={u.id === user?.id}
                  onClick={() => {
                    setUser(u.id);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-white/5 transition ${u.id === user?.id ? "bg-white/5" : ""}`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg bg-gradient-to-br ${roleColor[u.role]} flex items-center justify-center text-white text-xs font-bold`}
                  >
                    {u.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{u.name}</div>
                    <div className="text-[10px] text-ink-muted uppercase tracking-wider">
                      {roleLabel[u.role]}
                    </div>
                  </div>
                  {u.id === user?.id && (
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  )}
                </button>
              ))}
              <div className="border-t border-border my-1.5" />
              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-rose-400/10 text-rose-300 hover:text-rose-200 transition"
              >
                <div className="w-8 h-8 rounded-lg bg-rose-400/10 border border-rose-400/30 flex items-center justify-center">
                  <LogOut className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 text-sm font-medium">Cerrar sesión</div>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
