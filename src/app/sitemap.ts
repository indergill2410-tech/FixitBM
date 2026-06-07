import type { MetadataRoute } from "next";
import { blogPosts } from "@/lib/seo";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://fixit247.com.au";

const routes = [
  "",
  "/fixit-plus",
  "/propertysafe",
  "/post-job",
  "/home-emergencies",
  "/roadside-help",
  "/all-trade-jobs",
  "/projects",
  "/how-it-works",
  "/pricing",
  "/become-a-fixer",
  "/terms",
  "/privacy",
  "/contact"
];

export default function sitemap(): MetadataRoute.Sitemap {
  const publicRoutes = routes.map((route) => ({
    url: `${appUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? ("weekly" as const) : ("monthly" as const),
    priority: route === "" ? 1 : 0.7
  }));

  const blogRoutes = [
    {
      url: `${appUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.75
    },
    ...blogPosts.map((post) => ({
      url: `${appUrl}/blog/${post.slug}`,
      lastModified: new Date(post.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.65
    }))
  ];

  return [...publicRoutes, ...blogRoutes];
}
