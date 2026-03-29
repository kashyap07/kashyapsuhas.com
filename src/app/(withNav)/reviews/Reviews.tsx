"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";

import { CheckMini, XMarkMini } from "@components/icons";
import { Dialog, Wrapper } from "@components/ui";
import { type Review } from "@db/reviews";
import cn from "@utils/cn";

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
  selectedCategory: string | null; // should be type derived
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

// parse URL params into initial state
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
    sortOrder: {
      rating: ratingSort,
      name: null,
    },
  };
};

// serialize state to URL params
const serializeState = (reviewsState: ReviewsState): URLSearchParams => {
  const params = new URLSearchParams();

  if (reviewsState.searchString) {
    params.set("q", reviewsState.searchString);
  }

  if (reviewsState.selectedCategory) {
    params.set("cat", reviewsState.selectedCategory);
  }

  if (reviewsState.sortOrder.rating) {
    params.set("sort", "rating");
    params.set("order", reviewsState.sortOrder.rating.toLowerCase());
  }

  return params;
};

// apply filters and sorting to reviews
const applyFiltersAndSort = (reviewsState: ReviewsState): ReviewsState => {
  const { sourceReviews, searchString, selectedCategory, sortOrder } =
    reviewsState;

  let newReviews = [...sourceReviews];

  // order matters

  // 1. search
  const normalizedSearchString = searchString.toLowerCase().trim();
  newReviews = newReviews.filter(
    (review) =>
      review.name.toLowerCase().includes(normalizedSearchString) ||
      review.category.toLowerCase().includes(normalizedSearchString) ||
      review.summary.toLowerCase().includes(normalizedSearchString),
  );

  // 2. re calculate list of categories only if there is a search string
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
    // if no sort applied, maintain original order
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

      const newState = {
        ...reviewsState,
        sortOrder: { ...reviewsState.sortOrder, [action.payload]: newOrder },
      };

      return applyFiltersAndSort(newState);
    }

    case "SEARCH": {
      const newState = { ...reviewsState, searchString: action.payload };
      return applyFiltersAndSort(newState);
    }

    case "FILTER_CATEGORY": {
      const newSelectedCategory =
        reviewsState.selectedCategory === action.payload
          ? null
          : action.payload;

      const newState = {
        ...reviewsState,
        selectedCategory: newSelectedCategory,
      };

      return applyFiltersAndSort(newState);
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

      // parse URL params for initial state
      const urlState = parseUrlParams(searchParams);

      const initialState: ReviewsState = {
        sourceReviews: initialReviewsWithIndex,
        reviews: initialReviewsWithIndex,
        reviewCategories: getCategoriesList(initialReviewsWithIndex),
        searchString: urlState.searchString,
        selectedCategory: urlState.selectedCategory,
        sortOrder: urlState.sortOrder,
      };

      // apply filters/sort from URL on initial load
      return applyFiltersAndSort(initialState);
    },
  );

  // arrow hint state - shows every time until user clicks
  const [showHint, setShowHint] = useState(true);
  const [openDialogId, setOpenDialogId] = useState<number | null>(null);

  // track if this is the initial mount to avoid syncing URL on first render
  const isInitialMount = useRef(true);

  const dismissHint = useCallback(() => {
    setShowHint(false);
  }, []);

  // dismiss hint when any dialog opens
  useEffect(() => {
    if (openDialogId !== null) {
      dismissHint();
    }
  }, [openDialogId, dismissHint]);

  // sync URL with state changes (debounced for search)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const params = serializeState(reviewsState);
    const newUrl = params.toString()
      ? `${pathname}?${params.toString()}`
      : pathname;

    // use setTimeout to debounce search input
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

  // FIXME: tailwind run time situation
  const getCategoryColor = useCallback((category: string) => {
    const CATEGORY_COLOR_MAP = {
      Media: "bg-blue-100 text-blue-800",
      Technology: "bg-cyan-100 text-cyan-800",
      Vehicles: "bg-yellow-100 text-yellow-800",
      Games: "bg-rose-100 text-rose-800",
      Restaurants: "bg-green-100 text-green-800",
      Services: "bg-purple-100 text-purple-800",
      Travel: "bg-orange-100 text-orange-800",
      Photography: "bg-teal-100 text-teal-800",
      Others: "bg-stone-200 text-stone-800",
      default: "bg-gray-100 text-gray-800",
    };

    return (
      CATEGORY_COLOR_MAP[category as keyof typeof CATEGORY_COLOR_MAP] ??
      CATEGORY_COLOR_MAP.default
    );
  }, []);

  const selectedReview =
    openDialogId !== null
      ? (reviewsState.reviews.find((r) => r._idx === openDialogId) ?? null)
      : null;

  const RenderReviewRows = () => {
    if (reviewsState.reviews.length === 0) {
      return (
        <div className="text-muted py-4 text-center">No reviews found : (</div>
      );
    } else
      return (
        <>
          {reviewsState.reviews.map((review) => (
            <div
              key={review._idx}
              onClick={() => setOpenDialogId(review._idx)}
              className={cn(
                "group relative grid cursor-pointer grid-cols-4 items-center border-b px-2 py-4 md:grid-cols-9",
                "transition-all duration-200 ease-in-out",
                "hover:bg-surface-hover hover:shadow-sm",
              )}
            >
              <div
                role="button"
                className="group-hover:text-accent col-span-2 px-2 text-lg font-medium transition-colors"
                title={review.name}
              >
                {review.name}
              </div>

              <div className="text-md group-hover:text-accent col-span-1 px-2 transition-colors">
                {review.rating}
              </div>

              <div className="text-md group-hover:text-accent col-span-1 hidden px-2 transition-colors md:block">
                {review.wouldRecommend ? <CheckMini /> : <XMarkMini />}
              </div>

              <div className="col-span-1 px-2">
                <span
                  className={cn(
                    "inline-flex rounded px-2 py-2 text-xs font-semibold leading-5",
                    getCategoryColor(review.category),
                  )}
                >
                  {review.category}
                </span>
              </div>

              <div
                className="group-hover:text-accent col-span-4 hidden pl-2 text-base transition-colors md:block"
                title={review.summary}
              >
                {review.summary}
              </div>

              {/* arrow icon - outside table border */}
              <div className="absolute -right-8 top-1/2 hidden -translate-y-1/2 opacity-0 transition-opacity duration-200 group-hover:opacity-100 md:block">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="text-accent h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                  />
                </svg>
              </div>
            </div>
          ))}
        </>
      );
  };

  return (
    <Wrapper className="mb-section-sm md:mb-section-md w-full">
      {/* search — own row */}
      <input
        type="text"
        placeholder={"search reviews"}
        className="focus:outline-accent mb-4 w-full rounded border p-2 md:w-64"
        defaultValue={reviewsState.searchString}
        onChange={(e) => dispatch({ type: "SEARCH", payload: e.target.value })}
      />

      {/* filters + hint */}
      <div className="mb-4 flex min-h-10 items-center justify-between gap-6">
        <div className="flex flex-wrap gap-2">
          {reviewsState.reviewCategories.map((category) => (
            <button
              key={category}
              onClick={() =>
                dispatch({ type: "FILTER_CATEGORY", payload: category })
              }
              className={cn(
                "rounded border border-transparent px-2 py-2 text-xs font-medium transition-colors",
                reviewsState.selectedCategory === category
                  ? `${getCategoryColor(category)} ring-accent ring-2 ring-offset-2`
                  : `bg-surface-subtle text-secondary hover:bg-line`,
              )}
              aria-pressed={reviewsState.selectedCategory === category}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="hidden lg:block">
          {/* helper text */}
          <span className="text-muted flex items-center gap-2 text-sm">
            click on an item to read the entire thing
          </span>

          {/* dotted arrow pointing from helper text to first item */}
          {showHint && reviewsState.reviews.length > 0 && (
            <svg
              viewBox="100 100 100 160"
              className="pointer-events-none -right-40 top-[2rem] z-10 lg:absolute"
              width="220"
              height="220"
            >
              <path
                stroke="#E8B004"
                strokeWidth="2"
                strokeDasharray="5 5"
                fill="none"
                d="M 128.836 133.322 C 138.014 132.065 153.779 137.932 159.707 143.836 C 175.325 159.389 175.771 188.994 195.011 199.747 C 208.625 207.355 228.506 195.226 225.454 179.896 C 223.433 169.743 201.884 166.831 194.879 174.453 C 182.832 187.561 194.728 213.351 182.669 226.449 C 165.97 244.587 109.907 235.715 91.128 234.321"
              />
              <path
                stroke="#E8B004"
                strokeWidth="2"
                fill="none"
                d="M 99.068 230.439 C 95.675 234.373 87.598 232.063 93.631 236.361 C 94.264 236.812 94.902 237.257 95.554 237.682 C 97.307 238.825 98.243 239.341 100.015 240.385 C 102.043 241.581 98.037 239.124 99.997 240.425"
              />
            </svg>
          )}
        </div>
      </div>

      {/* reviews table */}
      <div className="w-full overflow-x-auto">
        <div className="relative w-full md:min-w-[850px]">
          {/* header */}
          <div className="bg-surface-subtle text-muted grid grid-cols-4 border-b px-2 py-3 text-xs font-semibold tracking-wider md:grid-cols-9">
            <div className="col-span-2 px-2">name</div>
            <button
              type="button"
              onClick={() =>
                dispatch({
                  type: "SORT",
                  payload: "rating",
                })
              }
              className="hover:text-secondary col-span-1 px-2 text-left"
            >
              rating
              <span className="ml-1 inline-block">
                {(() => {
                  const ratingSort = reviewsState.sortOrder.rating;
                  if (ratingSort === "ASC") return "▲";
                  if (ratingSort === "DESC") return "▼";
                  return "";
                })()}
              </span>
            </button>
            <div className="col-span-1 hidden px-2 md:block">recommend</div>
            <div className="col-span-1 px-2">category</div>
            <div className="col-span-4 hidden px-2 md:block">summary</div>
          </div>

          {/* rows */}
          <RenderReviewRows />
        </div>
      </div>

      {/* single shared dialog for all reviews */}
      <Dialog
        open={openDialogId !== null}
        onOpenChange={(open) => !open && setOpenDialogId(null)}
      >
        <Dialog.Content className="md:max-w-[50rem]">
          {selectedReview && (
            <>
              <Dialog.Header>
                <Dialog.Title className="text-2xl font-bold">
                  {selectedReview.name}
                </Dialog.Title>
                <Dialog.Description className="flex flex-wrap items-center gap-3">
                  <span
                    className={cn(
                      "inline-flex rounded px-2 py-2 text-xs font-semibold leading-5",
                      getCategoryColor(selectedReview.category),
                    )}
                  >
                    {selectedReview.category}
                  </span>
                  {selectedReview.reviewDate && (
                    <span className="text-md text-muted">
                      {new Date(selectedReview.reviewDate).toLocaleDateString()}
                    </span>
                  )}
                  <span
                    className={`text-md ${selectedReview.wouldRecommend ? "text-success" : "text-danger"}`}
                  >
                    {selectedReview.wouldRecommend
                      ? "Would Recommend"
                      : "Would Not Recommend"}
                  </span>
                </Dialog.Description>
              </Dialog.Header>

              <div className="mt-2">
                <h3 className="text-lg font-medium">Summary</h3>
                <p className="mt-2">{selectedReview.summary}</p>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <h3 className="text-lg font-medium">Pros</h3>
                  <ul className="mt-2 space-y-2">
                    {selectedReview.pros.map((pro, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">-</span>
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium">Cons</h3>
                  <ul className="mt-2 space-y-2">
                    {selectedReview.cons.map((con, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">-</span>
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {selectedReview.link && (
                <div className="mt-2">
                  <a
                    href={selectedReview.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all"
                  >
                    See More: {selectedReview.link}
                  </a>
                </div>
              )}
            </>
          )}
        </Dialog.Content>
      </Dialog>
    </Wrapper>
  );
}

export default Reviews;

// FIXME
// const CATEGORY_COLOR_MAP = {
//   Media: "blue",
//   Technology: "cyan",
//   Vehicles: "yellow",
//   Games: "indigo",
//   Restaurants: "green",
//   Services: "purple",
//   Travel: "orange",
//   Photography: "pink",
//   Others: "gray",
// };

// type Category = keyof typeof CATEGORY_COLOR_MAP;

// function getCategoryColor(category: string): string {
//   const color = CATEGORY_COLOR_MAP[category as Category] || "gray";
//   const twClass = `bg-${color}-100 text-${color}-800`;
//   return twClass;
// }
