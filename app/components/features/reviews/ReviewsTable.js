'use client';
import useSWR, { mutate } from 'swr';
import { useState } from 'react';
import { FiEye, FiEyeOff, FiTrash2 } from "react-icons/fi";
import { useAuthPut, useAuthFetcher, useAuthDelete } from "../../../lib/useAuthFetcher";
import { toast } from 'react-hot-toast';
import { ConfirmModal } from '../../index';

export default function ReviewsTable() {
    const fetcher = useAuthFetcher();
    const authPut = useAuthPut();
    const authDelete = useAuthDelete();
    const { data: reviews, error, isLoading } = useSWR("/reviews/all", fetcher);

    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        reviewId: null,
        reviewerName: ''
    });

    const toggleVisibility = async (id, currentHidden) => {
        try {
            await authPut(`/reviews/${id}/visibility`, { hidden: !currentHidden });
            mutate("/reviews/all");
            toast.success(`Review ${!currentHidden ? "hidden" : "visible"}`);
        } catch (err) {
            console.error("Failed to toggle review visibility:", err);
            toast.error("Failed to update review visibility");
        }
    };

    const openDeleteModal = (id, reviewerName) => {
        setDeleteModal({
            isOpen: true,
            reviewId: id,
            reviewerName: reviewerName
        });
    };

    const closeDeleteModal = () => {
        setDeleteModal({
            isOpen: false,
            reviewId: null,
            reviewerName: ''
        });
    };

    const confirmDelete = async () => {
        if (!deleteModal.reviewId) return;

        try {
            await authDelete(`/reviews/${deleteModal.reviewId}`);
            mutate("/reviews/all");
            toast.success("Review deleted successfully");
        } catch (err) {
            console.error("Failed to delete review:", err);
            toast.error("Failed to delete review");
        } finally {
            closeDeleteModal();
        }
    };


    if (isLoading)
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );

    if (error) {
        toast.error("Failed to load reviews");
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-500 font-semibold">
                Error loading reviews.
            </div>
        );
    }

    return (
        <div>
            {(!Array.isArray(reviews) || reviews.length === 0) ? (
                <div className="text-gray-500 text-center py-12">
                    No reviews found.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                    {reviews.map((review) => (
                        <div
                            key={review._id}
                            className={`bg-white rounded-2xl shadow-lg border p-6 flex flex-col justify-between hover:shadow-xl transition-all duration-300 group ${review.hidden ? "border-red-200 opacity-60" : "border-gray-100"
                                }`}
                        >
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                                        {review.name || "Anonymous"}
                                    </h3>
                                    <span className="text-xs text-gray-400 group-hover:text-gray-500 transition">
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500">{review.email || ""}</p>
                                <div className="flex items-center space-x-1">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <svg
                                            key={i}
                                            className={`w-5 h-5 transition ${i <= (review.rating || 0)
                                                ? "text-yellow-400"
                                                : "text-gray-300"
                                                }`}
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.11 3.405a1 1 0 00.95.69h3.588c.969 0 1.371 1.24.588 1.81l-2.904 2.11a1 1 0 00-.364 1.118l1.11 3.405c.3.921-.755 1.688-1.538 1.118l-2.904-2.11a1 1 0 00-1.175 0l-2.904 2.11c-.783.57-1.838-.197-1.538-1.118l1.11-3.405a1 1 0 00-.364-1.118L2.314 8.832c-.783-.57-.38-1.81.588-1.81h3.588a1 1 0 00.95-.69l1.11-3.405z" />
                                        </svg>
                                    ))}
                                </div>
                                <p className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap border-t border-gray-100 pt-4 mt-2">
                                    {review.comment}
                                </p>
                            </div>

                            {/* Action buttons */}
                            <div className="flex justify-end items-center space-x-3 mt-4">
                                {/* Toggle visibility button */}
                                <button
                                    onClick={() => toggleVisibility(review._id, review.hidden)}
                                    className="text-gray-600 hover:text-gray-800 transition-colors p-2 hover:bg-gray-100 rounded-full"
                                    title={review.hidden ? "Show Review" : "Hide Review"}
                                >
                                    {review.hidden ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                                </button>

                                {/* Delete button */}
                                <button
                                    onClick={() => openDeleteModal(review._id, review.name || "Anonymous")}
                                    className="text-red-600 hover:text-red-800 transition-colors p-2 hover:bg-red-50 rounded-full"
                                    title="Delete Review"
                                >
                                    <FiTrash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete confirmation modal */}
            <ConfirmModal
                open={deleteModal.isOpen}
                title="Delete Review"
                description={`Are you sure you want to delete the review from ${deleteModal.reviewerName}? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={confirmDelete}
                onCancel={closeDeleteModal}
            />
        </div>
    );
}