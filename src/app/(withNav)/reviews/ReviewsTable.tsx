"use client";

import { useState, useMemo } from "react";
import { Review } from "@/db/reviews";

export default function ReviewsTable({ reviews }: { reviews: Review[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  const categories = useMemo(() => {
    const uniqueCategories = new Set(reviews.map((review) => review.category));
    return Array.from(uniqueCategories);
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      const matchesCategory = selectedCategory === "all" || review.category === selectedCategory;
      const matchesSearch = searchQuery === "" || 
        review.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.summary.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [reviews, selectedCategory, searchQuery]);

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-4xl font-medium">Reviews</h1>
        <div className="flex flex-col gap-4 sm:flex-row">
          <input
            type="text"
            placeholder="Search reviews..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-columbiaYellow focus:outline-none"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-columbiaYellow focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Category</th>
              <th className="px-4 py-2 text-left">Rating</th>
              <th className="px-4 py-2 text-left">Summary</th>
            </tr>
          </thead>
          <tbody>
            {filteredReviews.map((review, index) => (
              <tr
                key={index}
                className="cursor-pointer border-b border-gray-200 hover:bg-gray-50"
                onClick={() => setSelectedReview(review)}
              >
                <td className="px-4 py-2">
                  {review.link ? (
                    <a
                      href={review.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-columbiaYellow hover:underline"
                    >
                      {review.name}
                    </a>
                  ) : (
                    review.name
                  )}
                </td>
                <td className="px-4 py-2">
                  {review.category.charAt(0).toUpperCase() + review.category.slice(1)}
                </td>
                <td className="px-4 py-2">{review.rating}/10</td>
                <td className="px-4 py-2">{review.summary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedReview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          onClick={() => setSelectedReview(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-medium">{selectedReview.name}</h2>
              <button
                onClick={() => setSelectedReview(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="mb-4">
              <span className="text-lg font-medium">Rating: {selectedReview.rating}/10</span>
            </div>
            <div className="mb-4">
              <h3 className="mb-2 text-lg font-medium">Summary</h3>
              <p className="text-gray-700">{selectedReview.summary}</p>
            </div>
            <div>
              <h3 className="mb-2 text-lg font-medium">Details</h3>
              <p className="whitespace-pre-wrap text-gray-700">{selectedReview.details}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 