import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Badge, Button, Card, PublicHeader } from "@/components/ui";
import { NewsletterForm } from "@/components/newsletter-form";
import { appUrl, articleJsonLd, blogPosts, getBlogPost } from "@/lib/seo";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) return {};

  return {
    title: `${post.title} | Fixit247 Guides`,
    description: post.description,
    alternates: {
      canonical: `/blog/${post.slug}`
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `${appUrl}/blog/${post.slug}`,
      type: "article",
      publishedTime: post.publishedAt
    }
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) notFound();

  return (
    <main className="premium-shell">
      <PublicHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd(post)) }} />
      <article className="container max-w-3xl py-14">
        <Badge>{post.category}</Badge>
        <h1 className="mt-5 text-[38px] font-black leading-tight tracking-tight md:text-[56px]">{post.title}</h1>
        <p className="mt-5 text-lg leading-8 text-[var(--text2)]">{post.description}</p>
        <p className="mt-4 text-sm font-bold text-[var(--text3)]">
          {new Date(post.publishedAt).toLocaleDateString("en-AU")} · {post.readTime}
        </p>
        <div className="mt-10 grid gap-8">
          {post.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-2xl font-black">{section.heading}</h2>
              <p className="mt-3 leading-8 text-[var(--text2)]">{section.body}</p>
            </section>
          ))}
        </div>
        <Card variant="emergency" className="mt-10">
          <h2 className="text-2xl font-black">Need help now?</h2>
          <p className="mt-2 leading-7 text-[var(--text2)]">
            Start a free request for emergency help, a standard trade job, or a larger project quote.
          </p>
          <Button href="/post-job" className="mt-5">Start a Request</Button>
        </Card>
        <Card variant="membership" className="mt-5">
          <h2 className="text-xl font-black">Get practical Fixit247 guides.</h2>
          <div className="mt-4">
            <NewsletterForm source={`blog:${post.slug}`} />
          </div>
        </Card>
      </article>
    </main>
  );
}
