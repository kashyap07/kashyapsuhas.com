"use client";

// TODO: this shouldn't be client side render lmao

import { useState } from "react";

import { Wrapper } from "@/components/Wrapper";
import { Review } from "@/db/reviews";
import { Dialog } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface Props {
  reviews: Review[];
}

function ReviewsClient({ reviews }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

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

  // Map category to color
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
            placeholder="Search reviews..."
            className="w-full rounded border p-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Category Filters */}
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
              className={`text-md rounded border border-transparent px-4 py-2 font-medium transition-colors ${
                selectedCategory === category
                  ? `${getCategoryColor(category)} ring-2 ring-blue-300 ring-offset-2`
                  : `bg-gray-100 text-gray-700 hover:bg-gray-200`
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews Grid Table */}
      <div className="w-full min-w-[850px]">
        {/* Header */}
        <div className="grid grid-cols-9 border-b bg-gray-50 px-2 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
          <div className="col-span-3 px-2">Name</div>
          <div className="col-span-1 px-2">Category</div>
          <div className="col-span-1 px-2">Recommend</div>
          <div className="col-span-1 px-2">Rating</div>
          <div className="col-span-3 px-2">Summary</div>
        </div>
        {/* Rows */}
        {filteredReviews.map((review) => (
          <div
            key={review.name}
            className="grid cursor-pointer grid-cols-9 items-center border-b px-2 py-4 hover:bg-gray-50"
            onClick={() => setSelectedReview(review)}
          >
            <div
              className="col-span-3 px-2 text-lg font-medium text-gray-900"
              title={review.name}
            >
              {review.name}
            </div>
            <div className="col-span-1 px-2">
              <span
                className={`inline-flex rounded px-2 py-2 text-xs font-semibold leading-5 ${getCategoryColor(review.category)}`}
              >
                {review.category}
              </span>
            </div>
            <div className="text-md {review.wouldRecommend ? 'text-green-600' : 'text-red-600'} col-span-1 px-2">
              {review.wouldRecommend ? "✅" : "❎"}
            </div>
            <div className="text-md col-span-1 px-2 text-gray-900">
              {review.rating}
            </div>
            <div
              className="text-md col-span-3 truncate px-2 text-gray-900"
              title={review.summary}
            >
              {review.summary}
            </div>
          </div>
        ))}
      </div>

      {/* Review Modal */}
      <Dialog
        open={selectedReview !== null}
        onClose={() => setSelectedReview(null)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-3xl rounded bg-white p-6">
            {selectedReview && (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <Dialog.Title className="text-2xl font-bold text-gray-900">
                      {selectedReview.name}
                    </Dialog.Title>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-md rounded bg-blue-100 px-2 py-1 font-medium text-blue-800">
                        {selectedReview.category}
                      </span>
                      {selectedReview.reviewDate && (
                        <span className="text-md text-gray-500">
                          {new Date(
                            selectedReview.reviewDate,
                          ).toLocaleDateString()}
                        </span>
                      )}
                      <span
                        className={`text-md ${selectedReview.wouldRecommend ? "text-green-600" : "text-red-600"}`}
                      >
                        {selectedReview.wouldRecommend
                          ? "✓ Would Recommend"
                          : "✗ Would Not Recommend"}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedReview(null)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-900">Summary</h3>
                  <p className="mt-2 text-gray-600">{selectedReview.summary}</p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Pros</h3>
                    <ul className="mt-2 space-y-2">
                      {selectedReview.pros.map((pro, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2 text-green-500">•</span>
                          <span className="text-gray-600">{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Cons</h3>
                    <ul className="mt-2 space-y-2">
                      {selectedReview.cons.map((con, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2 text-red-500">•</span>
                          <span className="text-gray-600">{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {selectedReview.link && (
                  <div className="mt-6">
                    <a
                      href={selectedReview.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      See More: {selectedReview.link}
                    </a>
                  </div>
                )}
              </div>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>
    </Wrapper>
  );
}

export default ReviewsClient;
