"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export default function KpiCard({
  icon: Icon,
  label,
  value,
  delta,
  hint,
  accent = false,
  delay = 0,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  delta?: string;
  hint?: string;
  accent?: boolean;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`glass p-5 relative overflow-hidden group ${accent ? "ring-1 ring-accent/40" : ""}`}
    >
      {accent && (
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-accent/20 blur-3xl" />
      )}
      <div className="flex items-start justify-between relative">
        <div>
          <div className="text-xs uppercase tracking-wider text-ink-muted">{label}</div>
          <div className={`mt-2 text-3xl font-bold tracking-tight ${accent ? "text-accent" : "text-ink"}`}>
            {value}
          </div>
          {delta && (
            <div className={`mt-1 text-xs ${delta.startsWith("-") ? "text-rose-400" : "text-emerald-400"}`}>
              {delta} vs ayer
            </div>
          )}
          {hint && <div className="mt-1 text-xs text-ink-muted">{hint}</div>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent ? "bg-accent/20 text-accent" : "bg-white/5 text-ink-dim"}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  );
}
