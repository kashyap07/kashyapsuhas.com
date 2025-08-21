"use client";

import { useCallback, useReducer } from "react";

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

const reviewsReducer = (reviewsState: ReviewsState, action: ReducerActions) => {
  const deriveReviewsState = (reviewsState: ReviewsState) => {
    const {
      sourceReviews,
      searchString,
      selectedCategory,
      sortOrder,
      reviewCategories,
    } = reviewsState;

    let newReviews = [...sourceReviews];
    const normalizedSearchString = searchString.toLowerCase().trim();

    // filter by category
    newReviews = selectedCategory
      ? newReviews.filter((review) => review.category === selectedCategory)
      : newReviews;

    // search
    newReviews = newReviews.filter(
      (review) =>
        review.name.toLowerCase().includes(normalizedSearchString) ||
        review.category.toLowerCase().includes(normalizedSearchString) ||
        review.summary.toLowerCase().includes(normalizedSearchString),
    );

    // sort
    newReviews = newReviews.sort((a, b) => {
      if (action.payload === "rating") {
        if (sortOrder.rating === null) return a._idx - b._idx; // third click resets to original order
        return sortOrder.rating === "DESC"
          ? b.rating - a.rating
          : a.rating - b.rating;
      }
      return 0;
    });

    // re calculate list of categories only if there is a search string
    const newReviewCategories = searchString
      ? getCategoriesList(newReviews) 
      : reviewCategories;

    return { reviews: newReviews, reviewCategories: newReviewCategories };
  };

  switch (action.type) {
    case "SORT": {
      const currentOrder = reviewsState.sortOrder[action.payload];
      const newOrder: SortOrder =
        currentOrder === null ? "DESC" : currentOrder === "DESC" ? "ASC" : null;

      const newState = {
        ...reviewsState,
        sortOrder: { ...reviewsState.sortOrder, [action.payload]: newOrder },
      };

      return {
        ...newState,
        ...deriveReviewsState(newState),
      };
    }

    case "SEARCH": {
      const newState = { ...reviewsState, searchString: action.payload };

      return {
        ...newState,
        ...deriveReviewsState(newState),
      };
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

      return {
        ...newState,
        ...deriveReviewsState(newState),
      };
    }

    default:
      return reviewsState;
  }
};

function Reviews({ reviews: initialReviews }: Props) {
  const [reviewsState, dispatch] = useReducer(
    reviewsReducer,
    initialReviews,
    (initialReviews) => {
      const initialReviewsWithIndex = initialReviews.map((r, idx) => ({
        ...r,
        _idx: idx,
      }));

      return {
        sourceReviews: initialReviewsWithIndex,
        reviews: initialReviewsWithIndex,
        reviewCategories: getCategoriesList(initialReviewsWithIndex),
        searchString: "",
        selectedCategory: null,
        sortOrder: {
          name: null,
          rating: null,
        },
      };
    },
  );

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

  const RenderReviewRows = () => {
    if (reviewsState.reviews.length === 0) {
      return (
        <div className="text-center text-gray-500 py-4">
          No reviews found : (
        </div>
      );
    } else
      return (
        <>
          {reviewsState.reviews.map((review) => (
            <Dialog key={review._idx}>
              <Dialog.Trigger asChild>
                <div className="grid cursor-pointer grid-cols-4 items-center border-b px-2 py-4 hover:bg-gray-50 md:grid-cols-9">
                  <div
                    role="button"
                    className="col-span-2 px-2 text-lg font-medium"
                    title={review.name}
                  >
                    {review.name}
                  </div>

                  <div className="text-md col-span-1 px-2">{review.rating}</div>

                  <div className="text-md col-span-1 hidden px-2 md:block">
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
                    className="col-span-4 hidden pl-2 text-base md:block"
                    title={review.summary}
                  >
                    {review.summary}
                  </div>
                </div>
              </Dialog.Trigger>

              <Dialog.Content className="md:max-w-[50rem]">
                <Dialog.Header>
                  <Dialog.Title className="text-2xl font-bold">
                    {review.name}
                  </Dialog.Title>
                  <Dialog.Description className="flex items-center gap-6">
                    <span
                      className={cn(
                        "inline-flex rounded px-2 py-2 text-xs font-semibold leading-5",
                        getCategoryColor(review.category),
                      )}
                    >
                      {review.category}
                    </span>
                    {review.reviewDate && (
                      <span className="text-md text-gray-500">
                        {new Date(review.reviewDate).toLocaleDateString()}
                      </span>
                    )}
                    <span
                      className={`text-md ${review.wouldRecommend ? "text-green-600" : "text-red-600"}`}
                    >
                      {review.wouldRecommend
                        ? "Would Recommend"
                        : "Would Not Recommend"}
                    </span>
                  </Dialog.Description>
                </Dialog.Header>

                <div className="mt-2">
                  <h3 className="text-lg font-medium">Summary</h3>
                  <p className="mt-2">{review.summary}</p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="text-lg font-medium">Pros</h3>
                    <ul className="mt-2 space-y-2">
                      {review.pros.map((pro, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2">-</span>
                          <span className="">{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Cons</h3>
                    <ul className="mt-2 space-y-2">
                      {review.cons.map((con, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2">-</span>
                          <span className="">{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {review.link && (
                  <div className="mt-2">
                    <a
                      href={review.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      See More: {review.link}
                    </a>
                  </div>
                )}
              </Dialog.Content>
            </Dialog>
          ))}
        </>
      );
  };

  return (
    <Wrapper className="mb-12 w-full md:mb-20">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-5xl font-medium md:text-8xl">Reviews</h1>
        <div className="mt-4 md:mt-0 md:w-64">
          <input
            type="text"
            placeholder={"search reviews"}
            className="w-full rounded border p-2 focus:outline-columbiaYellow"
            defaultValue={reviewsState.searchString}
            onChange={(e) =>
              dispatch({ type: "SEARCH", payload: e.target.value })
            }
          />
        </div>
      </div>

      {/* filters */}
      <div className="mb-8 min-h-10 h-10">
        <div className="flex flex-wrap gap-2">
          {reviewsState.reviewCategories.map((category) => (
            <button
              key={category}
              onClick={() =>
                dispatch({ type: "FILTER_CATEGORY", payload: category })
              }
              className={cn(
                "text-md rounded border border-transparent px-4 py-2 font-medium transition-colors",
                reviewsState.selectedCategory === category
                  ? `${getCategoryColor(category)} ring-2 ring-columbiaYellow ring-offset-2`
                  : `bg-gray-100 text-gray-700 hover:bg-gray-200`,
              )}
              aria-pressed={reviewsState.selectedCategory === category}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* reviews table */}
      <div className="w-full lg:min-w-[850px]">
        {/* header */}
        <div className="grid grid-cols-4 border-b bg-gray-50 px-2 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 md:grid-cols-9">
          <div className="col-span-2 px-2">Name</div>
          <button
            type="button"
            onClick={() =>
              dispatch({
                type: "SORT",
                payload: "rating",
              })
            }
            className="col-span-1 px-2 text-left hover:text-gray-700"
          >
            Rating
            <span className="ml-1 inline-block">
              {(() => {
                const ratingSort = reviewsState.sortOrder.rating;
                if (ratingSort === "ASC") return "▲";
                if (ratingSort === "DESC") return "▼";
                return "";
              })()}
            </span>
          </button>
          <div className="col-span-1 hidden px-2 sm:block">Recommend</div>
          <div className="col-span-1 px-2">Category</div>
          <div className="col-span-3 hidden px-2 md:block">Summary</div>
        </div>

        {/* rows */}
        <RenderReviewRows />
      </div>
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
