"use client";

import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function NewReviewModal({ isOpen, onClose }) {
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();
    const [rating, setRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onSubmit = async (data) => {
        if (rating === 0) {
            toast.error("Please select a rating");
            return;
        }

        setIsSubmitting(true);
        try {
            const reviewData = {
                ...data,
                rating,
                createdAt: new Date().toISOString(),
            };

            const response = await axios.post(`${BASE_URL}/reviews/new`, reviewData);

            if (response.status === 201) {
                toast.success("Review submitted!");
                onClose(); // Close modal
                router.refresh(); // Optional: Refresh reviews table
            }
        } catch (error) {
            console.error("Submission failed:", error);
            toast.error("Failed to submit review.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                {/* Overlay */}
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/30" />
                </Transition.Child>


                {/* Modal content */}
                <div className="fixed inset-0 flex items-center justify-center px-4">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <Dialog.Panel className="relative z-10 bg-white rounded-lg shadow-xl max-w-xl w-full p-6">
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-2 right-2 text-gray-500 hover:text-black"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>

                            <Dialog.Title className="text-xl font-bold mb-4">
                                Leave a Review
                            </Dialog.Title>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                {/* Rating */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Your Rating
                                    </label>
                                    <div className="flex items-center space-x-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setRating(star)}
                                                className={`w-8 h-8 transition-colors ${
                                                    star <= rating ? "text-yellow-400" : "text-gray-300"
                                                }`}
                                            >
                                                <svg
                                                    className="w-full h-full"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.11 3.405a1 1 0 00.95.69h3.588c.969 0 1.371 1.24.588 1.81l-2.904 2.11a1 1 0 00-.364 1.118l1.11 3.405c.3.921-.755 1.688-1.538 1.118l-2.904-2.11a1 1 0 00-1.175 0l-2.904 2.11c-.783.57-1.838-.197-1.538-1.118l1.11-3.405a1 1 0 00-.364-1.118L2.314 8.832c-.783-.57-.38-1.81.588-1.81h3.588a1 1 0 00.95-.69l1.11-3.405z" />
                                                </svg>
                                            </button>
                                        ))}
                                    </div>
                                    {errors.rating && (
                                        <p className="text-red-500 text-sm mt-1">
                                            Rating is required
                                        </p>
                                    )}
                                </div>

                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Your Name
                                    </label>
                                    <input
                                        {...register("name", { required: "Name is required" })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="John Doe"
                                    />
                                    {errors.name && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.name.message}
                                        </p>
                                    )}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Your Email
                                    </label>
                                    <input
                                        type="email"
                                        {...register("email", {
                                            required: "Email is required",
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: "Invalid email address",
                                            },
                                        })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="john@example.com"
                                    />
                                    {errors.email && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.email.message}
                                        </p>
                                    )}
                                </div>

                                {/* Comment */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Your Review
                                    </label>
                                    <textarea
                                        {...register("comment", {
                                            required: "Review text is required",
                                            minLength: {
                                                value: 10,
                                                message: "Review must be at least 10 characters",
                                            },
                                        })}
                                        rows="4"
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Share your experience..."
                                    />
                                    {errors.comment && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.comment.message}
                                        </p>
                                    )}
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? "Submitting..." : "Submit Review"}
                                </button>
                            </form>
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition>
    );
}