import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ventas",
  description:
    "Histórico de ventas con detalle por transacción, filtros por método de pago y fecha.",
  alternates: { canonical: "/ventas" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
