import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Punto de venta",
  description:
    "Caja registradora con búsqueda, carrito, métodos de pago (efectivo, tarjeta, Nequi, Daviplata) y descuento de stock automático.",
  alternates: { canonical: "/pos" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
