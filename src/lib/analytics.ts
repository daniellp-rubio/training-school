import type { Sale, Product } from "./types";

export function salesByDay(sales: Sale[], days = 7) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const buckets: { day: string; total: number; date: Date }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    buckets.push({
      day: d.toLocaleDateString("es-CO", { weekday: "short", day: "2-digit" }),
      total: 0,
      date: d,
    });
  }
  sales.forEach((s) => {
    const sd = new Date(s.date);
    sd.setHours(0, 0, 0, 0);
    const b = buckets.find((x) => x.date.getTime() === sd.getTime());
    if (b) b.total += s.total;
  });
  return buckets.map(({ day, total }) => ({ day, total }));
}

export function topProducts(sales: Sale[], products: Product[], n = 5) {
  const counts = new Map<string, number>();
  sales.forEach((s) =>
    s.items.forEach((i) => counts.set(i.productId, (counts.get(i.productId) ?? 0) + i.qty))
  );
  return [...counts.entries()]
    .map(([id, qty]) => {
      const p = products.find((x) => x.id === id);
      return p ? { id, name: p.name, brand: p.brand, qty, revenue: qty * p.price } : null;
    })
    .filter(Boolean)
    .sort((a, b) => (b!.qty - a!.qty))
    .slice(0, n) as { id: string; name: string; brand: string; qty: number; revenue: number }[];
}

export function lowStock(products: Product[]) {
  return products
    .filter((p) => p.stock <= p.minStock)
    .sort((a, b) => a.stock / Math.max(1, a.minStock) - b.stock / Math.max(1, b.minStock));
}

export function revenueByCategory(sales: Sale[], products: Product[]) {
  const totals: Record<string, number> = {};
  sales.forEach((s) =>
    s.items.forEach((i) => {
      const p = products.find((x) => x.id === i.productId);
      if (!p) return;
      totals[p.category] = (totals[p.category] ?? 0) + i.unitPrice * i.qty;
    })
  );
  const labels: Record<string, string> = {
    suplementos: "Suplementos",
    tecnologia: "Tecnología",
    accesorios: "Accesorios",
  };
  return Object.entries(totals).map(([k, v]) => ({ name: labels[k] ?? k, value: v }));
}

export function todaysRevenue(sales: Sale[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return sales
    .filter((s) => {
      const d = new Date(s.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    })
    .reduce((a, b) => a + b.total, 0);
}

export function yesterdayRevenue(sales: Sale[]) {
  const y = new Date();
  y.setDate(y.getDate() - 1);
  y.setHours(0, 0, 0, 0);
  return sales
    .filter((s) => {
      const d = new Date(s.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === y.getTime();
    })
    .reduce((a, b) => a + b.total, 0);
}
