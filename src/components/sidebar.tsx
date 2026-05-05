"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Receipt,
  Users,
  Sparkles,
  X,
} from "lucide-react";
import Logo from "./logo";
import { useCurrentUser } from "@/lib/store";
import { can, type Permission } from "@/lib/permissions";

const items: { href: string; label: string; icon: any; perm: Permission }[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, perm: "dashboard" },
  { href: "/pos", label: "Punto de venta", icon: ShoppingCart, perm: "pos" },
  { href: "/inventario", label: "Inventario", icon: Package, perm: "inventario" },
  { href: "/ventas", label: "Ventas", icon: Receipt, perm: "ventas" },
  { href: "/usuarios", label: "Usuarios", icon: Users, perm: "usuarios" },
  { href: "/asesor", label: "Asesor IA", icon: Sparkles, perm: "asesor" },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

function NavItems({ role, pathname, onItemClick }: { role: string; pathname: string; onItemClick?: () => void }) {
  return (
    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1" aria-label="Secciones">
      {items.map(({ href, label, icon: Icon, perm }) => {
        const allowed = can(role, perm);
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        if (!allowed) {
          return (
            <div
              key={href}
              aria-disabled="true"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-ink-muted opacity-40 cursor-not-allowed"
              title="Sin permiso para tu rol"
            >
              <Icon aria-hidden="true" className="w-4 h-4" />
              <span className="text-sm">{label}</span>
              <span className="sr-only"> (sin permiso)</span>
            </div>
          );
        }
        return (
          <Link
            key={href}
            href={href}
            onClick={onItemClick}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
              active
                ? "bg-accent/10 text-accent border border-accent/30 shadow-[inset_0_0_30px_-12px_rgba(59,130,246,0.45)]"
                : "text-ink-dim hover:text-ink hover:bg-white/5"
            }`}
          >
            <Icon aria-hidden="true" className="w-4 h-4" />
            <span>{label}</span>
            {active && <span aria-hidden="true" className="ml-auto w-1.5 h-1.5 rounded-full bg-accent" />}
          </Link>
        );
      })}
    </nav>
  );
}

const DemoBox = () => (
  <div className="p-4 border-t border-border">
    <div className="glass p-3 text-xs text-ink-dim leading-relaxed">
      <div className="text-accent font-semibold mb-1">Demo activa</div>
      Datos almacenados localmente. Reset desde Usuarios → ⋯
    </div>
  </div>
);

export default function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const user = useCurrentUser();
  const role = user?.role ?? "admin";

  return (
    <>
      {mobileOpen && (
        <>
          <div
            aria-hidden="true"
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={onMobileClose}
          />
          <aside
            aria-label="Navegación principal"
            className="fixed inset-y-0 left-0 z-50 w-72 flex flex-col border-r border-border bg-bg-elevated/95 backdrop-blur-xl lg:hidden"
          >
            <div className="px-5 py-5 border-b border-border flex items-center justify-between">
              <Logo />
              <button
                type="button"
                aria-label="Cerrar menú"
                onClick={onMobileClose}
                className="p-1.5 rounded-lg hover:bg-white/5 text-ink-dim"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <NavItems role={role} pathname={pathname} onItemClick={onMobileClose} />
            <DemoBox />
          </aside>
        </>
      )}

      <aside
        aria-label="Navegación principal"
        className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border bg-bg-elevated/40 backdrop-blur-xl sticky top-0 h-screen"
      >
        <div className="px-5 py-5 border-b border-border">
          <Logo />
        </div>
        <NavItems role={role} pathname={pathname} />
        <DemoBox />
      </aside>
    </>
  );
}
