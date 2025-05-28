import useSWR, { mutate } from 'swr';
import {useAuthFetcher} from "@/utils/useAuthFetcher";
import { toast } from 'react-hot-toast';

export default function AdminReviews() {
    const fetcher = useAuthFetcher();
    const { data: reviews, error, isLoading } = useSWR("/reviews/all", fetcher);

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

    if (!reviews || reviews.length === 0)
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-500 font-semibold">
                No reviews found.
            </div>
        );

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {reviews.map((review) => (
                <div
                    key={review._id}
                    className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col justify-between hover:shadow-xl transition-all duration-300 group"
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
                                    className={`w-5 h-5 transition ${
                                        i <= (review.rating || 0)
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
                </div>
            ))}
        </div>
    );
}