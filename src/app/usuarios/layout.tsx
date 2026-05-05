import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Usuarios y permisos",
  description:
    "Gestión del equipo con matriz de permisos por rol: administrador, cajero y entrenador.",
  alternates: { canonical: "/usuarios" },
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
