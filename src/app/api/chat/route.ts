import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { z } from "zod";
import type {
  ChatMessage,
  ChatProductSlim,
  ChatSaleSlim,
  ChatResponse,
} from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 10;

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
});

const ProductSchema = z.object({
  name: z.string().max(120),
  brand: z.string().max(80),
  category: z.string().max(40),
  price: z.number().nonnegative(),
  cost: z.number().nonnegative(),
  stock: z.number().int().nonnegative(),
  minStock: z.number().int().nonnegative(),
});

const SaleItemSchema = z.object({
  name: z.string().max(120),
  qty: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
});

const SaleSchema = z.object({
  date: z.string(),
  total: z.number().nonnegative(),
  items: z.array(SaleItemSchema).max(50),
});

const BodySchema = z.object({
  messages: z.array(MessageSchema).min(1).max(40),
  products: z.array(ProductSchema).max(500),
  sales: z.array(SaleSchema).max(500),
});

function buildContext(products: ChatProductSlim[], sales: ChatSaleSlim[]) {
  const totalRevenue = sales.reduce((a, s) => a + s.total, 0);
  const last7 = sales.filter(
    (s) => Date.now() - new Date(s.date).getTime() < 7 * 86400000
  );
  const last7Revenue = last7.reduce((a, s) => a + s.total, 0);

  const unitsByProduct = new Map<string, number>();
  for (const s of sales) {
    for (const i of s.items) {
      unitsByProduct.set(i.name, (unitsByProduct.get(i.name) ?? 0) + i.qty);
    }
  }

  const productLines = products
    .map((p) => {
      const sold = unitsByProduct.get(p.name) ?? 0;
      const status =
        p.stock === 0 ? "AGOTADO" : p.stock <= p.minStock ? "STOCK CRÍTICO" : "OK";
      const margin = p.price > 0 ? ((p.price - p.cost) / p.price) * 100 : 0;
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

function jsonResponse(data: ChatResponse, status: number) {
  return Response.json(data, { status });
}

export async function POST(req: NextRequest) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return jsonResponse({ ok: false, error: "JSON inválido" }, 400);
  }

  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) {
    return jsonResponse(
      { ok: false, error: "Payload inválido: " + parsed.error.issues[0]?.message },
      400
    );
  }

  const { messages, products, sales } = parsed.data;
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return jsonResponse(
      { ok: false, fallback: true, reply: fallbackReply(products, sales, messages) },
      200
    );
  }

  try {
    const client = new Anthropic({ apiKey, timeout: 8000 });
    const system = buildContext(products, sales);

    const resp = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system,
      messages,
    });

    const textBlock = resp.content.find((b) => b.type === "text");
    const reply = textBlock && "text" in textBlock ? textBlock.text : "Sin respuesta.";
    return jsonResponse({ ok: true, reply }, 200);
  } catch (err) {
    const message = err instanceof Error ? err.message : "error desconocido";
    return jsonResponse(
      { ok: false, fallback: true, reply: fallbackReply(products, sales, messages) },
      503
    );
  }
}

function fallbackReply(
  products: ChatProductSlim[],
  sales: ChatSaleSlim[],
  messages: ChatMessage[]
) {
  const last = messages[messages.length - 1]?.content?.toLowerCase() ?? "";
  const critical = products
    .filter((p) => p.stock <= p.minStock)
    .sort((a, b) => a.stock - b.stock);

  const unitsByProduct = new Map<string, number>();
  for (const s of sales) {
    for (const i of s.items) {
      unitsByProduct.set(i.name, (unitsByProduct.get(i.name) ?? 0) + i.qty);
    }
  }
  const top = [...unitsByProduct.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);

  if (last.includes("reabast") || last.includes("comprar") || last.includes("pedir")) {
    if (critical.length === 0)
      return "Inventario saludable: ningún SKU está bajo el mínimo. Te sugiero igual revisar los top sellers para asegurar 2 semanas de cobertura.";
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
      .map((p) => ({
        name: p.name,
        margin: p.price > 0 ? ((p.price - p.cost) / p.price) * 100 : 0,
      }))
      .sort((a, b) => b.margin - a.margin)
      .slice(0, 5);
    return `Mejores márgenes:\n${ranked.map((r) => `• ${r.name} — ${r.margin.toFixed(0)}%`).join("\n")}`;
  }
  return `Soy Coach Pro. Para activar respuestas con IA real configura ANTHROPIC_API_KEY en Vercel. Mientras tanto puedo darte:\n• Reabastecer (escribe "qué reabastecer")\n• Top productos ("top vendidos")\n• Análisis de márgenes ("márgenes")\n\nStock crítico ahora: ${critical.length} SKUs.`;
}
