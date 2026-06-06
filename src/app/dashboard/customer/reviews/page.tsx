import { Badge, Card, DashboardHeader } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { getCustomerReviews } from "@/lib/jobs";

export default async function CustomerReviewsPage() {
  const user = await requireRole(["customer", "admin", "super_admin"]);
  const reviews = await getCustomerReviews(user);

  return (
    <main className="premium-shell min-h-screen">
      <section className="container py-8">
        <DashboardHeader title="Reviews" role="Customer" />
        <div className="grid gap-4">
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
              <h2 className="font-black">No reviews submitted yet</h2>
              <p className="mt-2 text-[var(--text2)]">Completed requests can be reviewed from this page.</p>
            </Card>
          )}
        </div>
      </section>
    </main>
  );
}
