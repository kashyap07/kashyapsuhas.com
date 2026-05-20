import { type Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArrowUpRight, Check, Minus, Plus, X } from "lucide-react";

import { Wrapper } from "@components/ui";
import { getReviewBySlug, getReviews } from "@db/reviews";
import cn from "@utils/cn";

import {
  getCategoryBgColor,
  getCategoryIcon,
  getCategoryTextColor,
} from "../categories";

export const dynamic = "force-static";

export function generateStaticParams() {
  return getReviews().map((r) => ({ slug: r.slug }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata | undefined> {
  const { slug } = await props.params;
  const review = getReviewBySlug(slug);
  if (!review) return;

  const title = `${review.name} review`;
  return {
    title,
    description: review.summary,
    keywords: ["Suhas Kashyap", "review", review.name, review.category],
    openGraph: {
      title: `${title}`,
      description: review.summary,
      type: "article",
      url: `https://www.kashyapsuhas.com/reviews/${review.slug}`,
      images: ["/kashyapcom-og.png"],
    },
    alternates: {
      canonical: `https://www.kashyapsuhas.com/reviews/${review.slug}`,
    },
  };
}

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ReviewPage(props: Props) {
  const { slug } = await props.params;
  const review = getReviewBySlug(slug);
  if (!review) notFound();

  const Icon = getCategoryIcon(review.category);
  const categoryColor = getCategoryTextColor(review.category);
  const categoryBg = getCategoryBgColor(review.category);
  const reviewDate = new Date(review.reviewDate);
  const dateFormatted = reviewDate.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Wrapper maxWidth="WIDE" className="mb-section-sm w-full md:mb-section-md">
      {/* structured data */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Review",
            itemReviewed: {
              "@type": "Thing",
              name: review.name,
            },
            reviewRating: {
              "@type": "Rating",
              ratingValue: review.rating,
              bestRating: 10,
              worstRating: 0,
            },
            reviewBody: review.summary,
            datePublished: review.reviewDate,
            url: `https://www.kashyapsuhas.com/reviews/${review.slug}`,
            author: {
              "@type": "Person",
              "@id": "https://www.kashyapsuhas.com/#person",
              name: "Suhas Kashyap",
              url: "https://www.kashyapsuhas.com",
            },
          }),
        }}
      />

      {/* hero card, uses full WIDE width, tinted by category */}
      <section className={cn("rounded-lg p-6 md:p-10", categoryBg)}>
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row">
          {/* left: title + category/date */}
          <div className="min-w-0 flex-1">
            <h1 className="text-heading-sm font-medium md:text-heading-md">
              {review.name}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-sans text-sm">
              <Link
                href={`/reviews?cat=${encodeURIComponent(review.category)}`}
                className={cn(
                  "inline-flex items-center gap-1.5 transition-colors hover:underline",
                  categoryColor,
                )}
              >
                <Icon size={14} aria-hidden="true" />
                {review.category}
              </Link>
              <span aria-hidden="true" className="text-subtle">
                ·
              </span>
              <time dateTime={review.reviewDate} className="text-muted">
                {dateFormatted}
              </time>
            </div>
          </div>

          {/* right: rating + recommend stacked */}
          <div className="flex w-full shrink-0 flex-row items-baseline justify-between gap-2 font-sans md:w-auto md:flex-col md:items-end md:justify-normal">
            <div className="flex items-baseline gap-1 tabular-nums">
              <span className="text-3xl font-medium md:text-heading-md">
                {review.rating}
              </span>
              <span className="text-sm text-muted md:text-base">/10</span>
            </div>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-medium md:text-base",
                review.wouldRecommend ? "text-success" : "text-danger",
              )}
            >
              {review.wouldRecommend ? (
                <Check size={14} aria-hidden="true" />
              ) : (
                <X size={14} aria-hidden="true" />
              )}
              {review.wouldRecommend
                ? "would recommend"
                : "would not recommend"}
            </span>
          </div>
        </div>
      </section>

      {/* rest of content constrained to DEFAULT reading width */}
      <div className="mx-auto max-w-2xl">
        {/* summary */}
        <section className="mt-10 md:mt-14">
          <h2 className="font-sans text-xs uppercase tracking-wider text-muted">
            summary
          </h2>
          <p className="mt-3 text-base leading-relaxed md:text-lg">
            {review.summary}
          </p>
        </section>

        {/* pros / cons */}
        <section className="mt-10 grid grid-cols-1 gap-8 md:mt-14 md:grid-cols-2 md:gap-10">
          <div>
            <h2 className="font-sans text-xs uppercase tracking-wider text-muted">
              pros
            </h2>
            <ul className="mt-3 flex flex-col gap-2">
              {review.pros.map((pro, i) => (
                <li key={i} className="flex items-start gap-2.5 text-base">
                  <Plus
                    size={16}
                    className="mt-1 shrink-0 text-success"
                    aria-hidden="true"
                  />
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-sans text-xs uppercase tracking-wider text-muted">
              cons
            </h2>
            <ul className="mt-3 flex flex-col gap-2">
              {review.cons.map((con, i) => (
                <li key={i} className="flex items-start gap-2.5 text-base">
                  <Minus
                    size={16}
                    className="mt-1 shrink-0 text-danger"
                    aria-hidden="true"
                  />
                  <span>{con}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* external link */}
        {review.link && (
          <section className="mt-10 md:mt-14">
            <a
              href={review.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1.5 break-all font-sans text-sm text-secondary hover:text-accent"
            >
              See more
              <ArrowUpRight
                size={14}
                className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
              <span className="break-all text-muted">{review.link}</span>
            </a>
          </section>
        )}
      </div>
    </Wrapper>
  );
}
