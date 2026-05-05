"use client";

import { useApp, useCurrentUser, formatCOP } from "@/lib/store";
import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Loader2, RotateCcw, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Msg = { role: "user" | "assistant"; content: string };

const suggestions = [
  "¿Qué productos debería reabastecer esta semana?",
  "¿Cuáles son los top 5 más vendidos?",
  "Analiza márgenes y dime cuáles dan más rentabilidad",
  "¿Algún producto sin rotación?",
];

export default function AsesorPage() {
  const user = useCurrentUser();
  const products = useApp((s) => s.products);
  const sales = useApp((s) => s.sales);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fallbackMode, setFallbackMode] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const lowStock = products.filter((p) => p.stock <= p.minStock).length;
  const totalRev = sales.reduce((a, s) => a + s.total, 0);

  const send = async (textOverride?: string) => {
    const text = (textOverride ?? input).trim();
    if (!text || loading) return;
    setInput("");
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setLoading(true);
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 15000);
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          messages: next,
          products: products.map(({ name, brand, category, price, cost, stock, minStock }) => ({
            name,
            brand,
            category,
            price,
            cost,
            stock,
            minStock,
          })),
          sales: sales.map(({ date, total, items }) => ({
            date,
            total,
            items: items.map(({ name, qty, unitPrice }) => ({ name, qty, unitPrice })),
          })),
        }),
      });
      const data = await r.json();
      if (data.fallback) setFallbackMode(true);
      const reply =
        data.reply ??
        (data.error ? `Error: ${data.error}` : "Sin respuesta del servidor.");
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch (e) {
      const aborted = e instanceof DOMException && e.name === "AbortError";
      setMessages([
        ...next,
        {
          role: "assistant",
          content: aborted
            ? "Tiempo de espera agotado. Intenta una pregunta más corta."
            : "Error de conexión. Intenta de nuevo en unos segundos.",
        },
      ]);
    } finally {
      window.clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
      <div className="glass flex flex-col h-[calc(100vh-8rem)] overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-dim flex items-center justify-center shadow-glow">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="font-semibold flex items-center gap-2">
                Coach Pro
                <span className="chip text-[10px] text-accent border-accent/30 bg-accent/10">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  online
                </span>
              </div>
              <div className="text-xs text-ink-muted">
                Asesor IA con contexto de tu inventario y ventas en vivo
              </div>
            </div>
          </div>
          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              className="btn-ghost text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Limpiar
            </button>
          )}
        </div>

        <div
          ref={scroller}
          role="log"
          aria-live="polite"
          aria-label="Conversación con Coach Pro"
          className="flex-1 overflow-y-auto p-6 space-y-4"
        >
          {messages.length === 0 && (
            <div className="max-w-md mx-auto text-center pt-10">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/30 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-bold">Hola {user?.name?.split(" ")[0] ?? ""} 👋</h3>
              <p className="text-sm text-ink-dim mt-1">
                Pregúntame sobre inventario, reabastecimiento, márgenes o tendencias de venta. Veo todo el catálogo en tiempo real.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-6 text-left">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => send(s)}
                    className="p-3 rounded-xl bg-white/5 border border-border hover:border-accent/40 hover:bg-accent/5 transition text-xs text-ink-dim hover:text-ink"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-accent text-white font-medium"
                      : "bg-white/5 border border-border text-ink"
                  }`}
                >
                  {m.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/5 border border-border rounded-2xl px-4 py-3 flex items-center gap-2 text-ink-dim text-sm">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Analizando inventario y ventas…
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-border">
          {fallbackMode && (
            <div className="mb-2 flex items-center gap-2 text-[11px] text-amber-400">
              <AlertTriangle className="w-3 h-3" />
              Modo fallback (sin API key configurada). Configura ANTHROPIC_API_KEY en Vercel para IA completa.
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            aria-label="Enviar pregunta al asesor IA"
            className="flex items-center gap-2"
          >
            <label htmlFor="asesor-input" className="sr-only">Pregunta para Coach Pro</label>
            <input
              id="asesor-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pregúntale algo a Coach Pro…"
              className="input flex-1"
              disabled={loading}
            />
            <button
              type="submit"
              aria-label="Enviar pregunta"
              disabled={!input.trim() || loading}
              className="btn-primary px-4 py-2.5 disabled:opacity-40 disabled:shadow-none"
            >
              <Send aria-hidden="true" className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="glass p-5">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted">Contexto activo</div>
          <div className="mt-3 space-y-3">
            <Stat label="Productos analizados" value={products.length.toString()} />
            <Stat label="Ventas en histórico" value={sales.length.toString()} />
            <Stat label="Ingresos acumulados" value={formatCOP(totalRev)} />
            <Stat
              label="Stock crítico"
              value={lowStock.toString()}
              accent={lowStock > 0}
            />
          </div>
        </div>

        <div className="glass p-5 text-xs text-ink-dim leading-relaxed">
          <div className="text-accent font-semibold text-sm mb-2 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            Cómo lo usan los gerentes
          </div>
          <ul className="space-y-1.5 list-disc list-inside marker:text-accent/60">
            <li>Decisiones de compra semanales basadas en datos</li>
            <li>Detección de productos sin rotación</li>
            <li>Priorización de promociones por margen</li>
            <li>Pronóstico de quiebres de stock</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-ink-dim">{label}</span>
      <span className={`text-sm font-semibold ${accent ? "text-amber-400" : "text-ink"}`}>{value}</span>
    </div>
  );
}
