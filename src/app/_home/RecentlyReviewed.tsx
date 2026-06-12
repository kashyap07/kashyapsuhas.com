import Link from "next/link";

import Wrapper from "@components/ui/Wrapper";
import type { Review } from "@db/reviews";

// list rows match the blog index styling exactly, rating sits in the date slot
export default function RecentlyReviewed({ reviews }: { reviews: Review[] }) {
  return (
    <Wrapper className="relative z-10">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-body-lg font-medium md:text-heading-sm">
          recently reviewed
        </h2>
        <Link
          href="/reviews"
          className="font-sans text-label text-muted no-underline transition-colors hover:text-accent"
        >
          all reviews →
        </Link>
      </div>

      <ul className="mt-4 flex flex-col gap-1 md:mt-5">
        {reviews.map((review) => (
          <li key={review.slug}>
            <Link
              href={`/reviews/${review.slug}`}
              className="group -mx-3 block rounded-lg px-3 py-2.5 transition-colors hover:bg-surface-hover active:bg-surface-subtle md:-mx-4 md:px-4 md:py-3"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-baseline justify-between gap-3 md:gap-4">
                  <h3 className="text-lg font-medium leading-snug transition-colors group-hover:text-accent md:text-xl">
                    {review.name}
                  </h3>
                  <span className="shrink-0 font-sans text-sm tabular-nums text-muted group-hover:text-accent">
                    {review.rating}
                  </span>
                </div>
                {review.summary && (
                  <p className="text-sm leading-relaxed text-secondary transition-colors group-hover:text-foreground md:text-base">
                    {review.summary}
                  </p>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </Wrapper>
  );
}
