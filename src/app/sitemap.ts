import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://training-school.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "/", priority: 1, changeFrequency: "daily" },
    { path: "/pos", priority: 0.9, changeFrequency: "daily" },
    { path: "/inventario", priority: 0.8, changeFrequency: "weekly" },
    { path: "/ventas", priority: 0.7, changeFrequency: "daily" },
    { path: "/asesor", priority: 0.9, changeFrequency: "weekly" },
  ];

  return routes.map((r) => ({
    url: `${siteUrl}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
