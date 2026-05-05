"use client";

import { useApp, useCurrentUser, formatCOP } from "@/lib/store";
import { can } from "@/lib/permissions";
import type { Product, Category } from "@/lib/types";
import { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Package,
  X,
  Save,
} from "lucide-react";
import { motion } from "framer-motion";

const emptyProduct: Omit<Product, "id"> = {
  sku: "",
  name: "",
  brand: "",
  category: "suplementos",
  price: 0,
  cost: 0,
  stock: 0,
  minStock: 0,
};

export default function InventarioPage() {
  const user = useCurrentUser();
  const products = useApp((s) => s.products);
  const addProduct = useApp((s) => s.addProduct);
  const updateProduct = useApp((s) => s.updateProduct);
  const deleteProduct = useApp((s) => s.deleteProduct);

  const canEdit = user ? can(user.role, "inventarioEdit") : false;

  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [editing, setEditing] = useState<Product | (Omit<Product, "id"> & { id?: string }) | null>(null);

  const filtered = useMemo(
    () =>
      products
        .filter((p) => cat === "all" || p.category === cat)
        .filter((p) => {
          if (!q) return true;
          const t = q.toLowerCase();
          return (
            p.name.toLowerCase().includes(t) ||
            p.brand.toLowerCase().includes(t) ||
            p.sku.toLowerCase().includes(t)
          );
        })
        .sort((a, b) => a.name.localeCompare(b.name)),
    [products, q, cat]
  );

  const stats = {
    total: products.length,
    suplementos: products.filter((p) => p.category === "suplementos").length,
    tecnologia: products.filter((p) => p.category === "tecnologia").length,
    valor: products.reduce((a, p) => a + p.cost * p.stock, 0),
  };

  const save = () => {
    if (!editing) return;
    if ("id" in editing && editing.id) {
      updateProduct(editing.id, editing);
    } else {
      addProduct(editing);
    }
    setEditing(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-accent/80">Inventario</div>
          <h1 className="text-3xl font-bold tracking-tight mt-1">Catálogo de productos</h1>
          <p className="text-ink-dim text-sm mt-1">
            {stats.total} productos · {stats.suplementos} suplementos · {stats.tecnologia} tecnología · valor total{" "}
            <span className="text-accent">{formatCOP(stats.valor)}</span>
          </p>
        </div>
        {canEdit && (
          <button
            onClick={() => setEditing({ ...emptyProduct })}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            Nuevo producto
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[260px] max-w-md">
          <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
          <label htmlFor="inv-search" className="sr-only">Buscar producto</label>
          <input
            id="inv-search"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="input w-full pl-9"
            placeholder="Buscar por nombre, marca o SKU…"
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
                cat === c.v ? "bg-accent text-black font-semibold" : "text-ink-dim hover:text-ink"
              }`}
            >
              {c.l}
            </button>
          ))}
        </div>
      </div>

      <div className="glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-ink-muted border-b border-border">
                <th className="px-5 py-3">Producto</th>
                <th className="px-3 py-3">SKU</th>
                <th className="px-3 py-3">Categoría</th>
                <th className="px-3 py-3 text-right">Precio</th>
                <th className="px-3 py-3 text-right">Costo</th>
                <th className="px-3 py-3 text-right">Stock</th>
                {canEdit && <th className="px-5 py-3" />}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const ratio = p.stock / Math.max(1, p.minStock);
                return (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(i * 0.02, 0.4) }}
                    className="border-b border-border/60 hover:bg-white/3"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-white/5 border border-border flex items-center justify-center">
                          <Package className="w-4 h-4 text-ink-dim" />
                        </div>
                        <div>
                          <div className="font-medium">{p.name}</div>
                          <div className="text-[11px] text-ink-muted">{p.brand}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-ink-dim">{p.sku}</td>
                    <td className="px-3 py-3">
                      <span className="chip text-[10px] capitalize">{p.category}</span>
                    </td>
                    <td className="px-3 py-3 text-right font-medium">{formatCOP(p.price)}</td>
                    <td className="px-3 py-3 text-right text-ink-muted">{formatCOP(p.cost)}</td>
                    <td className="px-3 py-3 text-right">
                      <span
                        className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          ratio === 0
                            ? "bg-rose-400/10 text-rose-400"
                            : ratio < 1
                              ? "bg-amber-400/10 text-amber-400"
                              : "bg-emerald-400/10 text-emerald-400"
                        }`}
                      >
                        {p.stock}
                        <span className="text-[10px] opacity-60">/ {p.minStock}</span>
                      </span>
                    </td>
                    {canEdit && (
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            aria-label={`Editar ${p.name}`}
                            onClick={() => setEditing({ ...p })}
                            className="p-2 rounded-lg hover:bg-white/5 text-ink-dim hover:text-ink"
                          >
                            <Edit3 aria-hidden="true" className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            aria-label={`Eliminar ${p.name}`}
                            onClick={() => {
                              if (confirm(`¿Eliminar "${p.name}"?`)) deleteProduct(p.id);
                            }}
                            className="p-2 rounded-lg hover:bg-rose-400/10 text-ink-muted hover:text-rose-400"
                          >
                            <Trash2 aria-hidden="true" className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </motion.tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-ink-muted">
                    Sin resultados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="inv-modal-title"
          onKeyDown={(e) => e.key === "Escape" && setEditing(null)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-strong w-full max-w-lg p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 id="inv-modal-title" className="text-lg font-bold">
                {("id" in editing && editing.id) ? "Editar producto" : "Nuevo producto"}
              </h2>
              <button
                type="button"
                aria-label="Cerrar diálogo"
                onClick={() => setEditing(null)}
                className="p-2 rounded-lg hover:bg-white/5"
              >
                <X aria-hidden="true" className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Nombre"
                full
                value={editing.name}
                onChange={(v) => setEditing({ ...editing, name: v })}
              />
              <Field
                label="Marca"
                value={editing.brand}
                onChange={(v) => setEditing({ ...editing, brand: v })}
              />
              <Field
                label="SKU"
                value={editing.sku}
                onChange={(v) => setEditing({ ...editing, sku: v })}
              />
              <div className="col-span-2">
                <label className="text-[10px] uppercase tracking-wider text-ink-muted">Categoría</label>
                <select
                  value={editing.category}
                  onChange={(e) =>
                    setEditing({ ...editing, category: e.target.value as Category })
                  }
                  className="input w-full mt-1"
                >
                  <option value="suplementos">Suplementos</option>
                  <option value="tecnologia">Tecnología</option>
                  <option value="accesorios">Accesorios</option>
                </select>
              </div>
              <Field
                label="Precio venta (COP)"
                type="number"
                value={editing.price}
                onChange={(v) => setEditing({ ...editing, price: Number(v) })}
              />
              <Field
                label="Costo (COP)"
                type="number"
                value={editing.cost}
                onChange={(v) => setEditing({ ...editing, cost: Number(v) })}
              />
              <Field
                label="Stock actual"
                type="number"
                value={editing.stock}
                onChange={(v) => setEditing({ ...editing, stock: Number(v) })}
              />
              <Field
                label="Stock mínimo"
                type="number"
                value={editing.minStock}
                onChange={(v) => setEditing({ ...editing, minStock: Number(v) })}
              />
              <div className="col-span-2">
                <label className="text-[10px] uppercase tracking-wider text-ink-muted">Descripción</label>
                <textarea
                  value={editing.description ?? ""}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  className="input w-full mt-1 min-h-[80px] resize-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 mt-5">
              <button onClick={() => setEditing(null)} className="btn-ghost">
                Cancelar
              </button>
              <button onClick={save} className="btn-primary">
                <Save className="w-3.5 h-3.5" />
                Guardar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  full = false,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  full?: boolean;
}) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <label className="text-[10px] uppercase tracking-wider text-ink-muted">{label}</label>
      <input
        type={type}
        value={value as any}
        onChange={(e) => onChange(e.target.value)}
        className="input w-full mt-1"
      />
    </div>
  );
}
