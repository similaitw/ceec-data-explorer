import type { MetadataRoute } from "next";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap { return ["", "/trends", "/distribution", "/position", "/noncurrent", "/downloads", "/methodology", "/quality"].map((path) => ({ url: `https://ceec-data-explorer.vercel.app${path}`, lastModified: new Date("2026-08-24") })); }
