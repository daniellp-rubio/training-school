"use client";

import { useApp, useCurrentUser, formatCOP } from "@/lib/store";
import { can } from "@/lib/permissions";
import { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle2,
  Lock,
  Package,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const methods: { id: any; label: string; icon: any }[] = [
  { id: "efectivo", label: "Efectivo", icon: Banknote },
  { id: "tarjeta", label: "Tarjeta", icon: CreditCard },
  { id: "nequi", label: "Nequi", icon: Smartphone },
  { id: "daviplata", label: "Daviplata", icon: Smartphone },
];

export default function POSPage() {
  const user = useCurrentUser();
  const products = useApp((s) => s.products);
  const cart = useApp((s) => s.cart);
  const addToCart = useApp((s) => s.addToCart);
  const setCartQty = useApp((s) => s.setCartQty);
  const removeFromCart = useApp((s) => s.removeFromCart);
  const clearCart = useApp((s) => s.clearCart);
  const checkout = useApp((s) => s.checkout);

  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [method, setMethod] = useState<any>("efectivo");
  const [customer, setCustomer] = useState("");
  const [confirm, setConfirm] = useState<{ id: string; total: number } | null>(null);

  if (!user || !can(user.role, "pos")) {
    return (
      <div className="glass p-12 text-center">
        <Lock className="w-10 h-10 mx-auto text-ink-muted mb-3" />
        <h2 className="text-xl font-bold">Sin acceso al Punto de Venta</h2>
        <p className="text-sm text-ink-dim mt-2">
          Tu rol actual ({user?.role}) no tiene permiso para registrar ventas.
        </p>
      </div>
    );
  }

  const filtered = useMemo(
    () =>
      products.filter((p) => {
        if (cat !== "all" && p.category !== cat) return false;
        if (q) {
          const t = q.toLowerCase();
          return (
            p.name.toLowerCase().includes(t) ||
            p.brand.toLowerCase().includes(t) ||
            p.sku.toLowerCase().includes(t)
          );
        }
        return true;
      }),
    [products, q, cat]
  );

  const cartLines = cart.map((c) => {
    const p = products.find((x) => x.id === c.productId)!;
    return { ...c, product: p, subtotal: p.price * c.qty };
  });
  const total = cartLines.reduce((a, b) => a + b.subtotal, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const sale = checkout(method, customer || undefined);
    if (sale) {
      setConfirm({ id: sale.id, total: sale.total });
      setCustomer("");
      setTimeout(() => setConfirm(null), 2800);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
      <div>
        <div className="flex items-end justify-between flex-wrap gap-4 mb-5">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-accent/80">
              Punto de venta
            </div>
            <h1 className="text-3xl font-bold tracking-tight mt-1">
              Caja registradora
            </h1>
            <p className="text-ink-dim text-sm mt-1">
              Cajero: <span className="text-ink">{user.name}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-[260px]">
            <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
            <label htmlFor="pos-search" className="sr-only">Buscar producto</label>
            <input
              id="pos-search"
              type="search"
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nombre, marca o SKU…"
              className="input w-full pl-9"
            />
          </div>
          <div role="tablist" aria-label="Filtrar por categoría" className="flex items-center gap-1.5 bg-bg-elevated/60 border border-border rounded-xl p-1">
            {[
              { v: "all", l: "Todos" },
              { v: "suplementos", l: "Suplementos" },
              { v: "tecnologia", l: "Tecnología" },
              { v: "accesorios", l: "Accesorios" },
            ].map((c) => (
              <button
                key={c.v}
                type="button"
                role="tab"
                aria-selected={cat === c.v}
                onClick={() => setCat(c.v)}
                className={`px-3 py-1.5 text-xs rounded-lg transition ${
                  cat === c.v ? "bg-accent text-white font-semibold" : "text-ink-dim hover:text-ink"
                }`}
              >
                {c.l}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((p) => {
            const out = p.stock <= 0;
            const low = p.stock <= p.minStock;
            return (
              <button
                key={p.id}
                type="button"
                aria-label={`Añadir ${p.name} al carrito. Precio ${formatCOP(p.price)}. Stock ${p.stock}.${out ? " Agotado." : low ? " Stock bajo." : ""}`}
                onClick={() => !out && addToCart(p.id, 1)}
                disabled={out}
                className={`glass p-4 text-left transition relative group ${
                  out
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:border-accent/40 hover:shadow-glow active:scale-[0.98]"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-white/10 to-white/5 border border-border flex items-center justify-center">
                    <Package aria-hidden="true" className="w-5 h-5 text-ink-dim" />
                  </div>
                  {low && !out && (
                    <span className="chip text-amber-400 border-amber-400/40 bg-amber-400/10 text-[10px]">
                      bajo
                    </span>
                  )}
                  {out && (
                    <span className="chip text-rose-400 border-rose-400/40 bg-rose-400/10 text-[10px]">
                      agotado
                    </span>
                  )}
                </div>
                <div className="mt-3 text-sm font-medium leading-tight line-clamp-2 min-h-[2.5em]">
                  {p.name}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-ink-muted mt-1">
                  {p.brand}
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <div className="font-bold text-accent">{formatCOP(p.price)}</div>
                  <div className="text-[10px] text-ink-muted">stock {p.stock}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <aside className="glass p-5 sticky top-24 self-start max-h-[calc(100vh-7rem)] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm font-semibold">Carrito</div>
            <div className="text-xs text-ink-muted">{cartLines.length} producto{cartLines.length === 1 ? "" : "s"}</div>
          </div>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-ink-muted hover:text-rose-400 transition"
            >
              Vaciar
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1 -mr-1 min-h-[120px]">
          <AnimatePresence>
            {cartLines.map((l) => (
              <motion.div
                key={l.productId}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="p-3 rounded-xl bg-white/5 border border-border"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium leading-tight truncate">{l.product.name}</div>
                    <div className="text-[10px] text-ink-muted">{formatCOP(l.product.price)} c/u</div>
                  </div>
                  <button
                    type="button"
                    aria-label={`Quitar ${l.product.name} del carrito`}
                    onClick={() => removeFromCart(l.productId)}
                    className="text-ink-muted hover:text-rose-400"
                  >
                    <Trash2 aria-hidden="true" className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 bg-bg-elevated rounded-lg border border-border">
                    <button
                      type="button"
                      aria-label={`Disminuir cantidad de ${l.product.name}`}
                      onClick={() => setCartQty(l.productId, l.qty - 1)}
                      className="w-7 h-7 flex items-center justify-center hover:bg-white/5 rounded-l-lg"
                    >
                      <Minus aria-hidden="true" className="w-3 h-3" />
                    </button>
                    <span aria-live="polite" aria-label={`Cantidad: ${l.qty}`} className="text-sm font-medium w-6 text-center">{l.qty}</span>
                    <button
                      type="button"
                      aria-label={`Aumentar cantidad de ${l.product.name}`}
                      onClick={() =>
                        l.qty < l.product.stock && setCartQty(l.productId, l.qty + 1)
                      }
                      className="w-7 h-7 flex items-center justify-center hover:bg-white/5 rounded-r-lg disabled:opacity-30"
                      disabled={l.qty >= l.product.stock}
                    >
                      <Plus aria-hidden="true" className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="text-sm font-bold">{formatCOP(l.subtotal)}</div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {cartLines.length === 0 && (
            <div className="text-center py-10 text-sm text-ink-muted">
              Toca un producto para añadirlo
            </div>
          )}
        </div>

        <div className="border-t border-border pt-4 mt-4 space-y-3">
          <label htmlFor="pos-customer" className="sr-only">Nombre del cliente (opcional)</label>
          <input
            id="pos-customer"
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
            placeholder="Nombre del cliente (opcional)"
            className="input w-full"
          />
          <fieldset>
            <legend className="sr-only">Método de pago</legend>
            <div role="radiogroup" aria-label="Método de pago" className="grid grid-cols-2 gap-2">
              {methods.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  role="radio"
                  aria-checked={method === m.id}
                  onClick={() => setMethod(m.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition border ${
                    method === m.id
                      ? "bg-accent/15 border-accent/50 text-accent"
                      : "bg-white/5 border-border text-ink-dim hover:text-ink"
                  }`}
                >
                  <m.icon aria-hidden="true" className="w-3.5 h-3.5" />
                  {m.label}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="flex items-center justify-between">
            <span className="text-sm text-ink-dim">Total</span>
            <span className="text-2xl font-bold text-accent">{formatCOP(total)}</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="btn-primary w-full justify-center py-3 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            Cobrar venta
          </button>
        </div>

        <AnimatePresence>
          {confirm && (
            <motion.div
              role="status"
              aria-live="polite"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="fixed bottom-6 right-6 glass-strong px-5 py-4 flex items-center gap-3 shadow-glow z-50"
            >
              <CheckCircle2 aria-hidden="true" className="w-5 h-5 text-accent" />
              <div>
                <div className="text-sm font-semibold">Venta registrada</div>
                <div className="text-xs text-ink-muted">
                  {formatCOP(confirm.total)} · stock actualizado
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </aside>
    </div>
  );
}
