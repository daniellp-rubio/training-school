import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

type Product = {
  name: string;
  brand: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
};

type Sale = {
  date: string;
  total: number;
  items: { name: string; qty: number; unitPrice: number }[];
};

type Body = {
  messages: { role: "user" | "assistant"; content: string }[];
  products: Product[];
  sales: Sale[];
};

function buildContext(products: Product[], sales: Sale[]) {
  const totalRevenue = sales.reduce((a, s) => a + s.total, 0);
  const last7 = sales.filter((s) => {
    const d = new Date(s.date);
    return Date.now() - d.getTime() < 7 * 86400000;
  });
  const last7Revenue = last7.reduce((a, s) => a + s.total, 0);

  const unitsByProduct = new Map<string, number>();
  sales.forEach((s) =>
    s.items.forEach((i) => unitsByProduct.set(i.name, (unitsByProduct.get(i.name) ?? 0) + i.qty))
  );

  const productLines = products
    .map((p) => {
      const sold = unitsByProduct.get(p.name) ?? 0;
      const status =
        p.stock === 0 ? "AGOTADO" : p.stock <= p.minStock ? "STOCK CRÍTICO" : "OK";
      const margin = ((p.price - p.cost) / p.price) * 100;
      return `- ${p.name} (${p.brand}) | cat:${p.category} | precio:$${p.price} | costo:$${p.cost} | margen:${margin.toFixed(0)}% | stock:${p.stock}/min:${p.minStock} | unid_vendidas_total:${sold} | ${status}`;
    })
    .join("\n");

  return `Eres "Coach Pro", el asesor IA de Training School (gimnasio en Medellín, Colombia).
Tu rol: ayudar al dueño y al equipo a tomar decisiones de tienda — qué reabastecer, qué productos están performando, qué priorizar, alertas de margen.

Contexto en tiempo real:
- Productos en catálogo: ${products.length}
- Ventas históricas registradas: ${sales.length} (total ingresos: $${totalRevenue.toLocaleString("es-CO")} COP)
- Últimos 7 días: ${last7.length} ventas, ingresos $${last7Revenue.toLocaleString("es-CO")} COP
- Moneda: pesos colombianos (COP)

Catálogo completo con métricas:
${productLines}

REGLAS DE RESPUESTA:
1. Responde SIEMPRE en español, conciso y directo (máx 6 líneas salvo que pidan análisis profundo).
2. Usa los datos reales del catálogo de arriba — no inventes productos ni cifras.
3. Si recomiendas reabastecer, justifica con datos: stock actual, mínimo, ventas recientes, margen.
4. Si detectas riesgo (margen bajo, stock crítico de top sellers, productos sin rotación) menciónalo.
5. Tono: experto retail, sin floritura. Como un consultor que cobra caro.
6. Cuando sea útil, usa listas con guiones o tablas markdown simples.`;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body;
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return Response.json(
        {
          ok: false,
          fallback: true,
          reply: fallbackReply(body.products, body.sales, body.messages),
        },
        { status: 200 }
      );
    }

    const client = new Anthropic({ apiKey });
    const system = buildContext(body.products, body.sales);

    const resp = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system,
      messages: body.messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const textBlock = resp.content.find((b) => b.type === "text");
    const reply = textBlock && "text" in textBlock ? textBlock.text : "Sin respuesta.";
    return Response.json({ ok: true, reply });
  } catch (err: any) {
    return Response.json(
      { ok: false, error: err?.message ?? "error", reply: "El asesor está temporalmente fuera de servicio. Intenta de nuevo." },
      { status: 200 }
    );
  }
}

function fallbackReply(products: Product[], sales: Sale[], messages: Body["messages"]) {
  const last = messages[messages.length - 1]?.content?.toLowerCase() ?? "";
  const critical = products.filter((p) => p.stock <= p.minStock).sort((a, b) => a.stock - b.stock);
  const unitsByProduct = new Map<string, number>();
  sales.forEach((s) =>
    s.items.forEach((i) => unitsByProduct.set(i.name, (unitsByProduct.get(i.name) ?? 0) + i.qty))
  );
  const top = [...unitsByProduct.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);

  if (last.includes("reabast") || last.includes("comprar") || last.includes("pedir")) {
    if (critical.length === 0) return "Inventario saludable: ningún SKU está bajo el mínimo. Te sugiero igual revisar los top sellers para asegurar 2 semanas de cobertura.";
    const lines = critical.slice(0, 5).map((p) => {
      const sold = unitsByProduct.get(p.name) ?? 0;
      return `• ${p.name} — stock ${p.stock}/${p.minStock} (vendidas histórico: ${sold})`;
    });
    return `Prioridad de reabastecimiento (datos en vivo):\n${lines.join("\n")}\n\nRecomiendo pedido inmediato del agotado y ordenar el resto en 48h.`;
  }
  if (last.includes("top") || last.includes("vend") || last.includes("mejor")) {
    if (top.length === 0) return "Aún no hay ventas suficientes para identificar tendencias.";
    return `Top 3 más vendidos:\n${top.map(([n, q], i) => `${i + 1}. ${n} — ${q} unidades`).join("\n")}`;
  }
  if (last.includes("margen") || last.includes("rentab")) {
    const ranked = products
      .map((p) => ({ name: p.name, margin: ((p.price - p.cost) / p.price) * 100 }))
      .sort((a, b) => b.margin - a.margin)
      .slice(0, 5);
    return `Mejores márgenes:\n${ranked.map((r) => `• ${r.name} — ${r.margin.toFixed(0)}%`).join("\n")}`;
  }
  return `Soy Coach Pro. Para activar respuestas con IA real configura ANTHROPIC_API_KEY en Vercel. Mientras tanto puedo darte:\n• Reabastecer (escribe "qué reabastecer")\n• Top productos ("top vendidos")\n• Análisis de márgenes ("márgenes")\n\nStock crítico ahora: ${critical.length} SKUs.`;
}
