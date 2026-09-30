import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://continuity-passport.vercel.app";
  return [
    "",
    "/scan",
    "/docs",
    "/report",
    "/about",
    "/privacy",
    "/terms",
  ].map((path) => ({
    url: base + path,
    lastModified: new Date(),
  }));
}
