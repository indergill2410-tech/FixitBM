import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Card, PublicFooter, PublicHeader } from "@/components/ui";
import { NewsletterForm } from "@/components/newsletter-form";
import { appUrl, blogPosts } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Fixit247 Guides | Home emergency, roadside, and trade job advice",
  description: "Practical guides for home emergencies, roadside help, Fixit Plus peace of mind, and trade requests.",
  alternates: {
    canonical: "/blog"
  },
  openGraph: {
    title: "Fixit247 Guides",
    description: "Practical guides for home emergencies, roadside help, and trade requests.",
    url: `${appUrl}/blog`,
    type: "website"
  }
};

export default function BlogPage() {
  return (
    <main className="premium-shell">
      <PublicHeader />
      <section className="container py-14">
        <Badge>Fixit247 guides</Badge>
        <h1 className="mt-5 max-w-3xl text-[40px] font-black leading-tight tracking-tight md:text-[58px]">
          Calm advice for urgent home, road, and property moments.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--text2)]">
          Learn what to do before and during common household emergencies, and how to brief Fixers for repairs,
          maintenance, and projects.
        </p>
      </section>
      <section className="container grid gap-5 pb-12 md:grid-cols-3">
        {blogPosts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`}>
            <Card className="h-full">
              <Badge tone="gray">{post.category}</Badge>
              <h2 className="mt-4 text-xl font-black">{post.title}</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--text2)]">{post.description}</p>
              <p className="mt-5 text-xs font-bold uppercase tracking-wide text-[var(--text3)]">{post.readTime}</p>
            </Card>
          </Link>
        ))}
      </section>
      <section className="container pb-16">
        <Card variant="membership" className="max-w-2xl">
          <Badge>Newsletter</Badge>
          <h2 className="mt-4 text-2xl font-black">Get home emergency checklists and Fixit Plus updates.</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--text2)]">Useful, calm, practical guidance for Australian households.</p>
          <div className="mt-5">
            <NewsletterForm source="blog" />
          </div>
        </Card>
      </section>
      <PublicFooter />
    </main>
  );
}
