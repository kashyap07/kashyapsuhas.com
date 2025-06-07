"use client";

import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Wrapper } from "@/components/Wrapper";
import { Review } from "@/db/reviews";

interface ReviewsClientProps {
  reviews: Review[];
}

export default function ReviewsClient({ reviews }: ReviewsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  const categories = Array.from(new Set(reviews.map((review) => review.category)));

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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-5xl font-medium md:text-8xl">Reviews</h1>
        <div className="mt-4 md:mt-0 md:w-64">
          <input
            type="text"
            placeholder="Search reviews..."
            className="w-full p-2 border rounded"
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
              onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
              className={`px-4 py-2 rounded text-md font-medium transition-colors border border-transparent ${
                selectedCategory === category
                  ? `${getCategoryColor(category)} ring-2 ring-offset-2 ring-blue-300`
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
        <div className="grid grid-cols-9 bg-gray-50 font-semibold text-gray-500 uppercase text-xs tracking-wider px-2 py-3 border-b">
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
            className="grid grid-cols-9 items-center border-b hover:bg-gray-50 cursor-pointer px-2 py-4"
            onClick={() => setSelectedReview(review)}
          >
            <div className="col-span-3 font-medium text-lg text-gray-900 px-2" title={review.name}>{review.name}</div>
            <div className="col-span-1 px-2">
              <span className={`px-2 py-2 inline-flex text-xs leading-5 font-semibold rounded ${getCategoryColor(review.category)}`}>
                {review.category}
              </span>
            </div>
            <div className="col-span-1 text-md px-2 {review.wouldRecommend ? 'text-green-600' : 'text-red-600'}">
              {review.wouldRecommend ? '✅' : '❎'}
            </div>
            <div className="col-span-1 text-md text-gray-900 px-2">{review.rating}</div>
            <div className="px-2 col-span-3 text-md text-gray-900 truncate" title={review.summary}>{review.summary}</div>
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
                <div className="flex justify-between items-start">
                  <div>
                    <Dialog.Title className="text-2xl font-bold text-gray-900">
                      {selectedReview.name}
                    </Dialog.Title>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="px-2 py-1 text-md font-medium rounded bg-blue-100 text-blue-800">
                        {selectedReview.category}
                      </span>
                      {selectedReview.reviewDate && (
                        <span className="text-md text-gray-500">
                          {new Date(selectedReview.reviewDate).toLocaleDateString()}
                        </span>
                      )}
                      <span className={`text-md ${selectedReview.wouldRecommend ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedReview.wouldRecommend ? '✓ Would Recommend' : '✗ Would Not Recommend'}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Pros</h3>
                    <ul className="mt-2 space-y-2">
                      {selectedReview.pros.map((pro, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-500 mr-2">•</span>
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
                          <span className="text-red-500 mr-2">•</span>
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