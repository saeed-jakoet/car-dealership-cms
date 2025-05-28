"use client";
import axios from "axios";
import { useState } from "react";
import { toast } from "react-hot-toast";
import useSWR from "swr";
import { useAuthFetcher, useAuthPut } from "@/utils/useAuthFetcher";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const useDummyData = false; // Set to false for real API integration

export default function InboxPage() {
  const [selectedRequest, setSelectedRequest] = useState(null);

  const fetcher = useAuthFetcher();
  const authPut = useAuthPut();

  const { data: requests, error, isLoading } = useSWR("/inbox/all", fetcher);

  console.log("Inbox requests:", requests);

const markAsRead = (requestId) => {
  authPut(`/inbox/read/${requestId}`, { status: true })
    .then(() => {
      toast.success("Marked as read");

      // Update the selected request locally if it's the one being marked
      if (selectedRequest && selectedRequest._id === requestId) {
        setSelectedRequest((prev) => ({ ...prev, status: true }));
      }
      console.log("Marked request as read:", requestId);
      // Optional: refresh SWR data
      mutate("/inbox/all");
    })
    .catch((err) => {
      console.error("Error updating status:", err);
      toast.error("Update failed");
    });
};

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Customer Messages
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(requests) && requests.length > 0 ? (
          requests.map((request) => (
            <div
              key={request._id}
              className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 cursor-pointer ${
                !request.status ? "border-l-4 border-blue-500" : ""
              }`}
              onClick={() => {
                setSelectedRequest(request);
                if (!request.status) {
                  markAsRead(request._id);
                }
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {request.firstName} {request.lastName}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {!request.status && (
                  <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    New
                  </span>
                )}
              </div>

              <div className="space-y-2 mb-3">
                <p className="text-gray-600 truncate">
                  <span className="font-medium">Message:</span>{" "}
                  {request.message}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Contact:</span> {request.email}
                  {request.phone && ` • ${request.phone}`}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 col-span-full">No messages found.</p>
        )}
      </div>

      {/* Detail Modal */}
      {selectedRequest && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedRequest(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold">
                  {selectedRequest.firstName} {selectedRequest.lastName}
                </h2>
                <p className="text-gray-600">{selectedRequest.email}</p>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 flex items-center">
              <span className="text-sm text-gray-500 mr-4">
                {new Date(selectedRequest.createdAt).toLocaleString()}
              </span>
              {!selectedRequest.status && (
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  New Message
                </span>
              )}
            </div>

            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-2">Message:</h3>
              <p className="text-gray-600 whitespace-pre-wrap p-4 bg-gray-50 rounded-lg">
                {selectedRequest.message}
              </p>
            </div>

            {selectedRequest.phone && (
              <div className="mb-4">
                <h3 className="font-medium text-gray-900 mb-1">Phone:</h3>
                <p className="text-gray-600">{selectedRequest.phone}</p>
              </div>
            )}

            <div className="mt-8 flex justify-end space-x-4">
              {!selectedRequest.status && (
                <button
                  onClick={() => markAsRead(selectedRequest._id)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Mark as Read
                </button>
              )}
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
