import { Badge, Card, DashboardHeader, StatCard } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { getTradieReviews } from "@/lib/jobs";

export default async function TradieReviewsPage() {
  const user = await requireRole(["tradie", "admin", "super_admin"]);
  const reviews = await getTradieReviews(user);
  const average = reviews.length
    ? (reviews.reduce((total, review) => total + review.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <main className="premium-shell min-h-screen">
      <section className="container py-8">
        <DashboardHeader title="Reviews" role="Tradie" />
        <div className="grid gap-4 md:grid-cols-2">
          <StatCard label="Average rating" value={average} detail="Customer reviews" />
          <StatCard label="Total reviews" value={String(reviews.length)} detail="Completed jobs" />
        </div>
        <div className="mt-5 grid gap-4">
          {reviews.length ? (
            reviews.map((review) => (
              <Card key={review.id}>
                <Badge tone="green">{review.rating} / 5</Badge>
                <h2 className="mt-4 text-xl font-black">{review.job_title}</h2>
                <p className="mt-1 text-sm text-[var(--text3)]">{review.job_reference} · {new Date(review.created_at).toLocaleDateString()}</p>
                {review.comment ? <p className="mt-3 text-sm leading-6 text-[var(--text2)]">{review.comment}</p> : null}
              </Card>
            ))
          ) : (
            <Card>
              <h2 className="font-black">No customer reviews yet</h2>
              <p className="mt-2 text-[var(--text2)]">Reviews appear after customers rate completed jobs.</p>
            </Card>
          )}
        </div>
      </section>
    </main>
  );
}
