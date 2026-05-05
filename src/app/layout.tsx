import "./globals.css";
import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import AuthShell from "@/components/auth-shell";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://training-school.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Training School — Sistema de Tienda",
    template: "%s · Training School",
  },
  description:
    "Plataforma de gestión de tienda para Training School (Medellín). Inventario, POS, ventas y asesor IA con contexto en tiempo real.",
  applicationName: "Training School Tienda OS",
  authors: [{ name: "Training School" }],
  generator: "Next.js",
  keywords: [
    "gimnasio Medellín",
    "tienda gimnasio",
    "punto de venta",
    "inventario suplementos",
    "asesor IA retail",
    "Training School",
  ],
  category: "business",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: siteUrl,
    siteName: "Training School Tienda OS",
    title: "Training School — Sistema de Tienda",
    description:
      "Inventario, POS, ventas y asesor IA en un solo lugar. Demo de Tienda OS para gimnasios.",
    images: [
      {
        url: "/og.svg",
        width: 1200,
        height: 630,
        alt: "Training School — Sistema de Tienda",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Training School — Sistema de Tienda",
    description: "Inventario, POS y asesor IA con contexto en tiempo real.",
    images: ["/og.svg"],
  },
  icons: { icon: "/favicon.svg" },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#070709" },
    { media: "(prefers-color-scheme: light)", color: "#070709" },
  ],
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`dark ${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-3 focus:py-2 focus:rounded-lg focus:bg-accent focus:text-white focus:font-semibold"
        >
          Saltar al contenido principal
        </a>
        <AuthShell>{children}</AuthShell>
      </body>
    </html>
  );
}
