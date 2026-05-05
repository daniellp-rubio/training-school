"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  ShieldCheck,
  Sparkles,
  Activity,
  Box,
  AlertCircle,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { DEMO_CREDENTIALS } from "@/lib/seed";

const features = [
  {
    icon: Box,
    title: "Inventario en vivo",
    body: "Suplementos, tecnología y accesorios sincronizados con cada venta.",
  },
  {
    icon: Activity,
    title: "POS sin fricción",
    body: "Cobros con efectivo, tarjeta, Nequi y Daviplata. Stock se descuenta solo.",
  },
  {
    icon: Sparkles,
    title: "Asesor IA Coach Pro",
    body: "Recomienda qué reabastecer y detecta productos sin rotación en segundos.",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const login = useApp((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const result = login(email, password);
    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }
    router.replace("/");
  };

  const fillCredentials = (cred: typeof DEMO_CREDENTIALS[number]) => {
    setEmail(cred.email);
    setPassword(cred.password);
    setError(null);
  };

  return (
    <div className="min-h-screen w-full flex relative overflow-hidden">
      {/* Animated mesh background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_10%_-10%,rgba(59,130,246,0.18),transparent_55%),radial-gradient(700px_circle_at_100%_0%,rgba(96,165,250,0.14),transparent_60%),radial-gradient(800px_circle_at_50%_120%,rgba(30,64,175,0.18),transparent_60%)]" />
        <div className="absolute inset-0 grid-bg opacity-40" />
        <motion.div
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-accent/15 blur-3xl"
          animate={{ x: [0, 60, 0], y: [0, 30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-accent-bright/10 blur-3xl"
          animate={{ x: [0, -50, 0], y: [0, -40, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* LEFT: brand + features */}
      <div className="hidden lg:flex flex-col w-[55%] xl:w-[58%] p-10 xl:p-14 relative">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-white/15 to-white/0 border border-border-strong shadow-chrome flex items-center justify-center overflow-hidden">
            <Image
              src="/training_school.png"
              alt="Training School"
              width={48}
              height={48}
              priority
              className="object-contain"
            />
          </div>
          <div>
            <div className="text-base font-bold tracking-tight">Training School</div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-accent-bright/80">
              Tienda OS · Medellín
            </div>
          </div>
        </div>

        <div className="mt-auto max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="chip text-accent-bright border-accent/30 bg-accent/10 mb-5">
              <Sparkles className="w-3 h-3" />
              IA + Retail · v1.0 · Mayo 2026
            </span>
            <h1 className="text-4xl xl:text-5xl font-bold tracking-tight leading-[1.05]">
              La tienda del gimnasio,{" "}
              <span className="bg-gradient-to-r from-accent-bright via-accent to-accent-dim bg-clip-text text-transparent">
                operada por datos.
              </span>
            </h1>
            <p className="mt-5 text-ink-dim text-base leading-relaxed">
              Reemplaza el papel y lápiz por un sistema con punto de venta, inventario en
              vivo y un asesor IA que te dice qué reabastecer antes de quedarte sin stock.
            </p>
          </motion.div>

          <div className="mt-10 grid grid-cols-1 gap-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.08, duration: 0.45 }}
                className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.03] border border-border hover:border-accent/30 transition group"
              >
                <div className="w-10 h-10 shrink-0 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent-bright group-hover:bg-accent/20 transition">
                  <f.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm">{f.title}</div>
                  <div className="text-xs text-ink-dim mt-0.5 leading-relaxed">{f.body}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex items-center gap-2 text-[11px] text-ink-muted">
          <ShieldCheck className="w-3.5 h-3.5" />
          Sesión cifrada · datos del catálogo guardados localmente en demo
        </div>
      </div>

      {/* RIGHT: form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-10 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-white/10 to-white/0 border border-border-strong shadow-chrome flex items-center justify-center overflow-hidden">
              <Image
                src="/training_school.png"
                alt="Training School"
                width={44}
                height={44}
                priority
                className="object-contain"
              />
            </div>
            <div>
              <div className="text-base font-bold tracking-tight">Training School</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-accent-bright/80">
                Tienda OS
              </div>
            </div>
          </div>

          <div className="glass-strong p-7 lg:p-8 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-accent/15 blur-3xl pointer-events-none" />

            <div className="relative">
              <h2 className="text-2xl font-bold tracking-tight">Bienvenido de vuelta</h2>
              <p className="text-sm text-ink-dim mt-1">
                Inicia sesión para acceder al panel de tu rol.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="text-[10px] uppercase tracking-wider text-ink-muted"
                  >
                    Correo electrónico
                  </label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@trainingschool.co"
                      className="input w-full pl-10 py-2.5"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="text-[10px] uppercase tracking-wider text-ink-muted"
                    >
                      Contraseña
                    </label>
                    <button
                      type="button"
                      className="text-[11px] text-accent-bright/80 hover:text-accent-bright transition"
                      onClick={() =>
                        setError(
                          "Contacta al administrador para restablecer tu contraseña."
                        )
                      }
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                    <input
                      id="password"
                      type={show ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••"
                      className="input w-full pl-10 pr-10 py-2.5 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShow((v) => !v)}
                      aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
                    >
                      {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-400/10 border border-rose-400/30 text-rose-300 text-xs"
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={loading || !email || !password}
                  className="btn-primary w-full justify-center py-2.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verificando…
                    </>
                  ) : (
                    <>
                      Ingresar
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-7 pt-6 border-t border-border">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[10px] uppercase tracking-wider text-ink-muted">
                    Acceso rápido demo
                  </div>
                  <span className="chip text-[9px] text-accent-bright border-accent/20 bg-accent/5">
                    1 click
                  </span>
                </div>
                <div className="space-y-2">
                  {DEMO_CREDENTIALS.map((c) => (
                    <button
                      key={c.email}
                      type="button"
                      onClick={() => fillCredentials(c)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-border hover:border-accent/40 hover:bg-accent/5 transition text-left group"
                    >
                      <div
                        className={`w-9 h-9 rounded-lg bg-gradient-to-br ${c.accent} flex items-center justify-center text-white text-xs font-bold shadow-sm`}
                      >
                        {c.name
                          .split(" ")
                          .map((p) => p[0])
                          .slice(0, 2)
                          .join("")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold flex items-center gap-2">
                          {c.label}
                          <span className="text-[10px] font-normal text-ink-muted">
                            · {c.name}
                          </span>
                        </div>
                        <div className="text-[11px] text-ink-dim truncate">
                          {c.description}
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-ink-muted group-hover:text-accent-bright group-hover:translate-x-0.5 transition" />
                    </button>
                  ))}
                </div>
                <div className="mt-3 text-[10px] text-ink-muted leading-relaxed">
                  Toca cualquier rol para autocompletar. Las credenciales se listan en
                  pantalla solo en este entorno demo — en producción se eliminan.
                </div>
              </div>
            </div>
          </div>

          <div className="text-center text-[11px] text-ink-muted mt-6">
            © {new Date().getFullYear()} Training School · Medellín, Colombia.
            Construido con Next.js, Claude API y mucho café.
          </div>
        </motion.div>
      </div>
    </div>
  );
}
