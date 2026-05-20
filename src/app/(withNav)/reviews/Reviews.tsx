"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useReducer, useRef } from "react";

import { Check, X } from "lucide-react";

import { Wrapper } from "@components/ui";
import { type Review } from "@db/reviews";
import cn from "@utils/cn";

import {
  CATEGORY_BG_COLOR_MAP,
  CATEGORY_TEXT_COLOR_MAP,
  getCategoryIcon,
} from "./categories";

interface Props {
  reviews: Array<Review>;
}

type SortOrder = "ASC" | "DESC" | null;
type ReviewWithIndex = Review & { _idx: number };

type ReviewsState = {
  sourceReviews: Array<ReviewWithIndex>;
  reviews: Array<ReviewWithIndex>;
  reviewCategories: Array<string>;
  searchString: string;
  selectedCategory: string | null;
  sortOrder: {
    rating: SortOrder;
    name: SortOrder;
  };
};

type ReducerActions =
  | { type: "SORT"; payload: keyof ReviewsState["sortOrder"] }
  | { type: "FILTER_CATEGORY"; payload: string }
  | { type: "SEARCH"; payload: string };

const getCategoriesList = (reviews: Array<ReviewWithIndex>) => {
  return Array.from(new Set(reviews.map((r) => r.category))).sort();
};

const parseUrlParams = (searchParams: URLSearchParams) => {
  const searchString = searchParams.get("q") || "";
  const selectedCategory = searchParams.get("cat") || null;
  const sortField = searchParams.get("sort");
  const sortOrderParam = searchParams.get("order");

  let ratingSort: SortOrder = null;
  if (sortField === "rating" && sortOrderParam) {
    ratingSort = sortOrderParam.toUpperCase() === "ASC" ? "ASC" : "DESC";
  }

  return {
    searchString,
    selectedCategory,
    sortOrder: { rating: ratingSort, name: null },
  };
};

const serializeState = (reviewsState: ReviewsState): URLSearchParams => {
  const params = new URLSearchParams();
  if (reviewsState.searchString) params.set("q", reviewsState.searchString);
  if (reviewsState.selectedCategory)
    params.set("cat", reviewsState.selectedCategory);
  if (reviewsState.sortOrder.rating) {
    params.set("sort", "rating");
    params.set("order", reviewsState.sortOrder.rating.toLowerCase());
  }
  return params;
};

const applyFiltersAndSort = (reviewsState: ReviewsState): ReviewsState => {
  const { sourceReviews, searchString, selectedCategory, sortOrder } =
    reviewsState;

  let newReviews = [...sourceReviews];

  // 1. search
  const normalizedSearchString = searchString.toLowerCase().trim();
  newReviews = newReviews.filter(
    (review) =>
      review.name.toLowerCase().includes(normalizedSearchString) ||
      review.category.toLowerCase().includes(normalizedSearchString) ||
      review.summary.toLowerCase().includes(normalizedSearchString),
  );

  // 2. categories from search-filtered set
  const newReviewCategories = getCategoriesList(newReviews);

  // 3. filter by category
  newReviews = selectedCategory
    ? newReviews.filter((review) => review.category === selectedCategory)
    : newReviews;

  // 4. sort
  newReviews = newReviews.sort((a, b) => {
    if (sortOrder.rating !== null) {
      return sortOrder.rating === "DESC"
        ? b.rating - a.rating
        : a.rating - b.rating;
    }
    return a._idx - b._idx;
  });

  return {
    ...reviewsState,
    reviews: newReviews,
    reviewCategories: newReviewCategories,
  };
};

const reviewsReducer = (reviewsState: ReviewsState, action: ReducerActions) => {
  switch (action.type) {
    case "SORT": {
      const currentOrder = reviewsState.sortOrder[action.payload];
      const newOrder: SortOrder =
        currentOrder === null ? "DESC" : currentOrder === "DESC" ? "ASC" : null;
      return applyFiltersAndSort({
        ...reviewsState,
        sortOrder: { ...reviewsState.sortOrder, [action.payload]: newOrder },
      });
    }
    case "SEARCH":
      return applyFiltersAndSort({
        ...reviewsState,
        searchString: action.payload,
      });
    case "FILTER_CATEGORY": {
      const newSelectedCategory =
        reviewsState.selectedCategory === action.payload
          ? null
          : action.payload;
      return applyFiltersAndSort({
        ...reviewsState,
        selectedCategory: newSelectedCategory,
      });
    }
    default:
      return reviewsState;
  }
};

function Reviews({ reviews: initialReviews }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [reviewsState, dispatch] = useReducer(
    reviewsReducer,
    initialReviews,
    (initialReviews) => {
      const initialReviewsWithIndex = initialReviews.map((r, idx) => ({
        ...r,
        _idx: idx,
      }));
      const urlState = parseUrlParams(searchParams);
      return applyFiltersAndSort({
        sourceReviews: initialReviewsWithIndex,
        reviews: initialReviewsWithIndex,
        reviewCategories: getCategoriesList(initialReviewsWithIndex),
        searchString: urlState.searchString,
        selectedCategory: urlState.selectedCategory,
        sortOrder: urlState.sortOrder,
      });
    },
  );

  // skip URL sync on initial mount
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const params = serializeState(reviewsState);
    const newUrl = params.toString()
      ? `${pathname}?${params.toString()}`
      : pathname;

    // debounce so search input doesn't flood history
    const timeoutId = setTimeout(() => {
      router.push(newUrl, { scroll: false });
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [
    reviewsState.searchString,
    reviewsState.selectedCategory,
    reviewsState.sortOrder,
    router,
    pathname,
  ]);

  const renderRows = () => {
    if (reviewsState.reviews.length === 0) {
      return (
        <div className="py-4 text-center text-muted">No reviews found : (</div>
      );
    }
    return (
      <ul className="flex flex-col gap-6 md:gap-8">
        {reviewsState.reviews.map((review) => {
          const Icon = getCategoryIcon(review.category);
          return (
            <li key={review._idx}>
              <Link
                href={`/reviews/${review.slug}`}
                className="group block transition-colors"
              >
                <div className="flex flex-col gap-1 md:flex-row md:items-start md:gap-6">
                  <div className="md:min-w-0 md:flex-1">
                    <h3
                      className="text-lg font-medium transition-colors group-hover:text-accent md:text-xl"
                      title={review.name}
                    >
                      {review.name}
                    </h3>
                    <p
                      className="mt-1 hidden text-base text-secondary transition-colors group-hover:text-foreground md:block"
                      title={review.summary}
                    >
                      {review.summary}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-3 font-sans text-sm text-muted md:gap-4 md:pt-1">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5",
                        CATEGORY_TEXT_COLOR_MAP[review.category] ??
                          "text-stone-700",
                      )}
                    >
                      <Icon size={14} className="shrink-0" aria-hidden="true" />
                      <span className="truncate">{review.category}</span>
                    </span>
                    <span className="flex w-4 justify-center">
                      {review.wouldRecommend ? (
                        <Check
                          size={14}
                          className="text-success"
                          aria-label="recommend"
                        />
                      ) : (
                        <X
                          size={14}
                          className="text-danger"
                          aria-label="do not recommend"
                        />
                      )}
                    </span>
                    <span className="w-8 text-right tabular-nums">
                      {review.rating}
                    </span>
                  </div>
                </div>

                <p
                  className="mt-1 text-base text-secondary transition-colors group-hover:text-foreground md:hidden"
                  title={review.summary}
                >
                  {review.summary}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <Wrapper
      maxWidth="DEFAULT"
      className="mb-section-sm w-full md:mb-section-md"
    >
      {/* search */}
      <input
        type="text"
        placeholder="search reviews"
        className="mb-4 w-full rounded border border-line p-2 font-sans text-sm focus:outline-accent md:w-64"
        defaultValue={reviewsState.searchString}
        onChange={(e) => dispatch({ type: "SEARCH", payload: e.target.value })}
      />

      {/* filters + sort */}
      <div className="mb-6 flex min-h-10 items-center justify-between gap-6">
        <div className="flex flex-wrap gap-2">
          {reviewsState.reviewCategories.map((category) => {
            const Icon = getCategoryIcon(category);
            const active = reviewsState.selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() =>
                  dispatch({ type: "FILTER_CATEGORY", payload: category })
                }
                className={cn(
                  "inline-flex items-center gap-1 rounded px-2 py-2 font-sans text-xs font-medium transition-all",
                  CATEGORY_BG_COLOR_MAP[category] ?? "bg-stone-50",
                  active
                    ? `${CATEGORY_TEXT_COLOR_MAP[category] ?? "text-stone-700"} ring-2 ring-accent ring-offset-2`
                    : "text-secondary opacity-70 hover:opacity-100",
                )}
                aria-pressed={active}
              >
                <Icon size={12} aria-hidden="true" />
                {category}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => dispatch({ type: "SORT", payload: "rating" })}
          className="shrink-0 font-sans text-xs uppercase tracking-wider text-muted transition-colors hover:text-accent"
        >
          sort: rating
          <span className="ml-1 inline-block">
            {(() => {
              const ratingSort = reviewsState.sortOrder.rating;
              if (ratingSort === "ASC") return "▲";
              if (ratingSort === "DESC") return "▼";
              return "·";
            })()}
          </span>
        </button>
      </div>

      {renderRows()}
    </Wrapper>
  );
}

export default Reviews;
