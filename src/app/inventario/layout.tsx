import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inventario",
  description:
    "Catálogo de productos con CRUD, control de stock mínimo, costos y márgenes por categoría (suplementos, tecnología, accesorios).",
  alternates: { canonical: "/inventario" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
