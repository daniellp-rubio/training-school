"use client";

import { useApp, useCurrentUser, formatCOP } from "@/lib/store";
import { can } from "@/lib/permissions";
import { useState, useMemo } from "react";
import { Receipt, Lock, ChevronDown, ChevronUp, User2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function VentasPage() {
  const user = useCurrentUser();
  const sales = useApp((s) => s.sales);
  const [filter, setFilter] = useState<string>("all");
  const [open, setOpen] = useState<string | null>(null);

  if (!user || !can(user.role, "ventas")) {
    return (
      <div className="glass p-12 text-center">
        <Lock className="w-10 h-10 mx-auto text-ink-muted mb-3" />
        <h2 className="text-xl font-bold">Sin acceso al histórico de ventas</h2>
        <p className="text-sm text-ink-dim mt-2">Tu rol ({user?.role}) no permite ver ventas.</p>
      </div>
    );
  }

  const filtered = useMemo(() => {
    if (filter === "all") return sales;
    if (filter === "today") {
      const t = new Date();
      t.setHours(0, 0, 0, 0);
      return sales.filter((s) => {
        const d = new Date(s.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === t.getTime();
      });
    }
    return sales.filter((s) => s.paymentMethod === filter);
  }, [sales, filter]);

  const total = filtered.reduce((a, b) => a + b.total, 0);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-accent/80">Histórico</div>
        <h1 className="text-3xl font-bold tracking-tight mt-1">Ventas registradas</h1>
        <p className="text-ink-dim text-sm mt-1">
          {filtered.length} ventas · total {formatCOP(total)}
        </p>
      </div>

      <div className="flex items-center gap-1.5 bg-bg-elevated/60 border border-border rounded-xl p-1 w-fit">
        {[
          { v: "all", l: "Todas" },
          { v: "today", l: "Hoy" },
          { v: "efectivo", l: "Efectivo" },
          { v: "tarjeta", l: "Tarjeta" },
          { v: "nequi", l: "Nequi" },
          { v: "daviplata", l: "Daviplata" },
        ].map((f) => (
          <button
            key={f.v}
            onClick={() => setFilter(f.v)}
            className={`px-3 py-1.5 text-xs rounded-lg transition ${
              filter === f.v ? "bg-accent text-black font-semibold" : "text-ink-dim hover:text-ink"
            }`}
          >
            {f.l}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((s) => {
          const isOpen = open === s.id;
          const date = new Date(s.date);
          return (
            <div key={s.id} className="glass overflow-hidden">
              <button
                onClick={() => setOpen(isOpen ? null : s.id)}
                className="w-full flex items-center gap-4 p-4 text-left hover:bg-white/3 transition"
              >
                <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                  <Receipt className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <div className="text-xs text-ink-muted uppercase tracking-wider">Venta</div>
                    <div className="font-mono text-xs text-ink">{s.id.slice(0, 10)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-ink-muted uppercase tracking-wider">Fecha</div>
                    <div className="text-sm">
                      {date.toLocaleDateString("es-CO", { day: "2-digit", month: "short" })}{" "}
                      {date.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <div className="text-xs text-ink-muted uppercase tracking-wider">Cajero</div>
                    <div className="text-sm flex items-center gap-1.5">
                      <User2 className="w-3 h-3 text-ink-dim" />
                      {s.cashierName}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-ink-muted uppercase tracking-wider">Total</div>
                    <div className="text-sm font-bold text-accent">{formatCOP(s.total)}</div>
                  </div>
                </div>
                <span className="chip text-[10px] capitalize">{s.paymentMethod}</span>
                {isOpen ? <ChevronUp className="w-4 h-4 text-ink-dim" /> : <ChevronDown className="w-4 h-4 text-ink-dim" />}
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-border overflow-hidden"
                  >
                    <div className="p-5 bg-bg-elevated/40">
                      {s.customerName && (
                        <div className="text-sm mb-3">
                          <span className="text-ink-muted">Cliente:</span>{" "}
                          <span className="font-medium">{s.customerName}</span>
                        </div>
                      )}
                      <div className="space-y-1.5">
                        {s.items.map((it, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between text-sm py-1.5 border-b border-border/40 last:border-0"
                          >
                            <div className="flex-1 min-w-0">
                              <span className="font-medium">{it.name}</span>
                              <span className="text-ink-muted ml-2">× {it.qty}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">
                                {formatCOP(it.qty * it.unitPrice)}
                              </div>
                              <div className="text-[11px] text-ink-muted">
                                {formatCOP(it.unitPrice)} c/u
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="glass p-10 text-center text-sm text-ink-muted">
            Sin ventas para este filtro.
          </div>
        )}
      </div>
    </div>
  );
}
