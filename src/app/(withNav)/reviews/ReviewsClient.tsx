"use client";

// TODO: this shouldn't be client side render lmao

import { useState } from "react";

import { CheckMini, XMarkMini } from "@/components/icons";
import { Dialog, Wrapper } from "@/components/ui";
import { Review } from "@/db/reviews";
import cn from "@/utils/cn";

interface Props {
  reviews: Review[];
}

function ReviewsClient({ reviews }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Array.from(
    new Set(reviews.map((review) => review.category)),
  );

  const filteredReviews = reviews.filter((review) => {
    if (selectedCategory && review.category !== selectedCategory) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        review.name.toLowerCase().includes(query) ||
        review.category.toLowerCase().includes(query) ||
        review.summary.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // map category to color
  // TODO: make this more elegant
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Media":
        return "bg-purple-100 text-purple-800";
      case "Technology":
        return "bg-blue-100 text-blue-800";
      case "Vehicles":
        return "bg-yellow-100 text-yellow-800";
      case "Games":
        return "bg-pink-100 text-pink-800";
      case "Restaurants":
        return "bg-green-100 text-green-800";
      case "Services":
        return "bg-orange-100 text-orange-800";
      case "Travel":
        return "bg-cyan-100 text-cyan-800";
      case "Photography":
        return "bg-indigo-100 text-indigo-800";
      case "Others":
        return "bg-gray-200 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Wrapper className="mb-12 w-full md:mb-20">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-5xl font-medium md:text-8xl">Reviews</h1>
        <div className="mt-4 md:mt-0 md:w-64">
          <input
            type="text"
            placeholder={"search reviews"}
            className="w-full rounded border p-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* filters */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() =>
                setSelectedCategory(
                  selectedCategory === category ? null : category,
                )
              }
              className={cn(
                "text-md rounded border border-transparent px-4 py-2 font-medium transition-colors",
                selectedCategory === category
                  ? `${getCategoryColor(category)} ring-2 ring-blue-300 ring-offset-2`
                  : `bg-gray-100 text-gray-700 hover:bg-gray-200`,
              )}
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
          <div className="col-span-3 px-2">Name</div>
          <div className="col-span-1 px-2">Category</div>
          <div className="col-span-1 hidden px-2 sm:block">Recommend</div>
          <div className="col-span-1 hidden px-2 md:block">Rating</div>
          <div className="col-span-3 hidden px-2 md:block">Summary</div>
        </div>

        {/* rows */}
        {filteredReviews.map((review) => (
          <Dialog key={review.name}>
            <Dialog.Trigger asChild>
              <div className="grid cursor-pointer grid-cols-4 items-center border-b px-2 py-4 hover:bg-gray-50 md:grid-cols-9">
                <div
                  role="button"
                  tabIndex={0}
                  className="col-span-3 px-2 text-lg font-medium text-gray-900"
                  title={review.name}
                >
                  {review.name}
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

                <div className="text-md {review.wouldRecommend ? 'text-green-600' : 'text-red-600'} col-span-1 hidden px-2 md:block">
                  {review.wouldRecommend ? <CheckMini /> : <XMarkMini />}
                </div>

                <div className="text-md col-span-1 hidden px-2 text-gray-900 md:block">
                  {review.rating}
                </div>

                <div
                  className="text-md col-span-3 hidden px-2 text-gray-900 md:block"
                  title={review.summary}
                >
                  {review.summary}
                </div>
              </div>
            </Dialog.Trigger>

            <Dialog.Content className="md:max-w-[50rem]">
              <Dialog.Header>
                <Dialog.Title className="text-2xl font-bold text-gray-900">
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
                <h3 className="text-lg font-medium text-gray-900">Summary</h3>
                <p className="mt-2 text-gray-600">{review.summary}</p>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Pros</h3>
                  <ul className="mt-2 space-y-2">
                    {review.pros.map((pro, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span className="text-gray-600">{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Cons</h3>
                  <ul className="mt-2 space-y-2">
                    {review.cons.map((con, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span className="text-gray-600">{con}</span>
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
      </div>
    </Wrapper>
  );
}

export default ReviewsClient;
