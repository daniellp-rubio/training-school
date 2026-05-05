import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Asesor IA Coach Pro",
  description:
    "Asesor IA con contexto de inventario y ventas en tiempo real. Recomienda reabastecimiento, márgenes y tendencias.",
  alternates: { canonical: "/asesor" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
