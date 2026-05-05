"use client";

import { useApp, formatCOP } from "@/lib/store";
import {
  todaysRevenue,
  yesterdayRevenue,
  salesByDay,
  topProducts,
  lowStock,
  revenueByCategory,
} from "@/lib/analytics";
import KpiCard from "@/components/kpi-card";
import SalesChart from "@/components/charts/sales-chart";
import CategoryChart from "@/components/charts/category-chart";
import {
  DollarSign,
  ShoppingBag,
  AlertTriangle,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Dashboard() {
  const products = useApp((s) => s.products);
  const sales = useApp((s) => s.sales);

  const today = todaysRevenue(sales);
  const yesterday = yesterdayRevenue(sales);
  const delta = yesterday === 0 ? 0 : ((today - yesterday) / yesterday) * 100;
  const todayCount = sales.filter((s) => {
    const d = new Date(s.date);
    d.setHours(0, 0, 0, 0);
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return d.getTime() === t.getTime();
  }).length;

  const low = lowStock(products);
  const tops = topProducts(sales, products);
  const categoryData = revenueByCategory(sales, products);
  const series = salesByDay(sales);

  const totalStockValue = products.reduce((a, p) => a + p.stock * p.cost, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-accent/80">
            Panel ejecutivo
          </div>
          <h1 className="text-3xl font-bold tracking-tight mt-1">
            Buenos días, Training School
          </h1>
          <p className="text-ink-dim text-sm mt-1">
            Resumen en tiempo real del desempeño de la tienda.
          </p>
        </div>
        <Link href="/asesor" className="btn-primary group">
          <Sparkles className="w-4 h-4" />
          Pregúntale al Asesor IA
          <ArrowUpRight className="w-3.5 h-3.5 opacity-70 group-hover:translate-x-0.5 transition" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          icon={DollarSign}
          label="Ventas hoy"
          value={formatCOP(today)}
          delta={`${delta > 0 ? "+" : ""}${delta.toFixed(1)}%`}
          accent
          delay={0}
        />
        <KpiCard
          icon={ShoppingBag}
          label="Transacciones hoy"
          value={`${todayCount}`}
          hint={`${sales.length} totales en histórico`}
          delay={0.05}
        />
        <KpiCard
          icon={TrendingUp}
          label="Valor inventario"
          value={formatCOP(totalStockValue)}
          hint={`${products.reduce((a, p) => a + p.stock, 0)} unidades`}
          delay={0.1}
        />
        <KpiCard
          icon={AlertTriangle}
          label="Stock crítico"
          value={`${low.length}`}
          hint="productos requieren reposición"
          delay={0.15}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="glass p-5 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-semibold">Ventas — últimos 7 días</div>
              <div className="text-xs text-ink-muted">Ingresos diarios consolidados</div>
            </div>
            <span className="chip text-accent border-accent/30 bg-accent/5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" /> En vivo
            </span>
          </div>
          <SalesChart data={series} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="glass p-5"
        >
          <div className="text-sm font-semibold">Mix por categoría</div>
          <div className="text-xs text-ink-muted mb-4">Ingresos del histórico</div>
          <CategoryChart data={categoryData} />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="glass p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold">Top productos</div>
            <span className="text-[10px] uppercase tracking-wider text-ink-muted">
              Por unidades vendidas
            </span>
          </div>
          <div className="space-y-2">
            {tops.map((p, i) => (
              <div
                key={p.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-border hover:border-accent/30 transition group"
              >
                <div className="w-8 h-8 rounded-lg bg-bg-elevated border border-border flex items-center justify-center text-xs font-bold text-accent">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{p.name}</div>
                  <div className="text-xs text-ink-muted">{p.brand}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">{p.qty} und</div>
                  <div className="text-xs text-ink-muted">{formatCOP(p.revenue)}</div>
                </div>
              </div>
            ))}
            {tops.length === 0 && (
              <div className="text-sm text-ink-muted">Aún no hay ventas registradas.</div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="glass p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Stock crítico
              </div>
              <div className="text-xs text-ink-muted">
                Bajo o por debajo del mínimo recomendado
              </div>
            </div>
            <Link href="/inventario" className="text-xs text-accent hover:underline">
              Ver inventario →
            </Link>
          </div>
          <div className="space-y-2">
            {low.slice(0, 6).map((p) => {
              const ratio = p.stock / Math.max(1, p.minStock);
              const danger = ratio === 0 ? "rose" : ratio < 1 ? "amber" : "emerald";
              return (
                <div
                  key={p.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-border"
                >
                  <div
                    className={`w-2 h-10 rounded-full ${
                      danger === "rose"
                        ? "bg-rose-400"
                        : danger === "amber"
                          ? "bg-amber-400"
                          : "bg-emerald-400"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{p.name}</div>
                    <div className="text-xs text-ink-muted">
                      {p.brand} · mín. {p.minStock}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-sm font-bold ${
                        ratio === 0
                          ? "text-rose-400"
                          : ratio < 1
                            ? "text-amber-400"
                            : "text-emerald-400"
                      }`}
                    >
                      {p.stock}
                    </div>
                    <div className="text-[10px] text-ink-muted uppercase tracking-wider">
                      en stock
                    </div>
                  </div>
                </div>
              );
            })}
            {low.length === 0 && (
              <div className="text-sm text-ink-muted">Todo el inventario está saludable.</div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
