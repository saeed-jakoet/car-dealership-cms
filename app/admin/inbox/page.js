"use client";
import axios from "axios";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const useDummyData = true; // Set to false for real API integration

// Status configuration with styling
const statusConfig = {
  'New': { color: 'bg-blue-100 text-blue-800', label: 'New' },
  'In Progress': { color: 'bg-yellow-100 text-yellow-800', label: 'In Progress' },
  'Completed': { color: 'bg-green-100 text-green-800', label: 'Completed' },
  'On Hold': { color: 'bg-red-100 text-red-800', label: 'On Hold' }
};

export default function InboxPage() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const updateStatus = (requestId, newStatus) => {
    if (useDummyData) {
      setRequests(prev => prev.map(req => 
        req._id === requestId ? { ...req, status: newStatus } : req
      ));
      toast.success('Status updated (demo)');
    } else {
      axios.patch(`${BASE_URL}/inbox/${requestId}`, { status: newStatus })
        .then(() => {
          setRequests(prev => prev.map(req => 
            req._id === requestId ? { ...req, status: newStatus } : req
          ));
          toast.success('Status updated');
        })
        .catch(err => {
          console.error("Error updating status:", err);
          toast.error("Status update failed");
        });
    }
  };

  useEffect(() => {
    if (useDummyData) {
      setTimeout(() => {
        setRequests([
          {
            _id: "1",
            name: "John Smith",
            email: "john@example.com",
            message: "Looking to sell my 2018 Toyota Corolla with 45,000km",
            createdAt: new Date().toISOString(),
            phone: "+27 123 456 789",
            status: "New",
            carDetails: {
              make: "Toyota",
              model: "Corolla",
              year: 2018,
              mileage: 45000,
              condition: "Excellent"
            }
          },
          {
            _id: "2",
            name: "Sarah Johnson",
            email: "sarahj@example.com",
            message: "2015 BMW 320i for sale, full service history",
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            phone: "+27 987 654 321",
            status: "In Progress",
            carDetails: {
              make: "BMW",
              model: "320i",
              year: 2015,
              mileage: 120000,
              condition: "Good"
            }
          }
        ]);
        setIsLoading(false);
      }, 1000);
    } else {
      axios.get(`${BASE_URL}/inbox`)
        .then(res => setRequests(res.data.data || []))
        .catch(err => {
          console.error("Error fetching requests:", err);
          toast.error("Failed to load messages");
        })
        .finally(() => setIsLoading(false));
    }
  }, []);

  const RequestCard = ({ request }) => (
    <div
      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 cursor-pointer"
      onClick={() => setSelectedRequest(request)}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {request.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm ${statusConfig[request.status].color}`}>
            {statusConfig[request.status].label}
          </span>
          <span className="text-sm text-gray-500">
            {new Date(request.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
      
      <div className="space-y-2">
        <p className="text-gray-600">
          <span className="font-medium">Vehicle:</span>{" "}
          {request.carDetails?.year} {request.carDetails?.make} {request.carDetails?.model}
        </p>
        <p className="text-gray-600">
          <span className="font-medium">Mileage:</span>{" "}
          {request.carDetails?.mileage?.toLocaleString()} km
        </p>
        <p className="text-gray-600 truncate">
          <span className="font-medium">Message:</span> {request.message}
        </p>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-sm text-gray-600">
          <span className="font-medium">Contact:</span> {request.email}
          {request.phone && ` • ${request.phone}`}
        </p>
      </div>
    </div>
  );

  const StatusSelector = ({ currentStatus, onChange, requestId }) => (
    <select 
      value={currentStatus}
      onChange={(e) => onChange(requestId, e.target.value)}
      className={`mt-1 block w-full rounded-md border py-2 px-3 shadow-sm ${statusConfig[currentStatus].color} border-transparent`}
    >
      {Object.keys(statusConfig).map(status => (
        <option key={status} value={status}>
          {status}
        </option>
      ))}
    </select>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Customer Sell Requests</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {requests.map(request => (
          <RequestCard key={request._id} request={request} />
        ))}
      </div>

      {/* Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-2xl w-full">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">{selectedRequest.name}'s Request</h2>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Status:</p>
                  <StatusSelector
                    currentStatus={selectedRequest.status}
                    onChange={updateStatus}
                    requestId={selectedRequest._id}
                  />
                </div>
                <div>
                  <p className="font-medium">Email:</p>
                  <p className="text-gray-600">{selectedRequest.email}</p>
                </div>
                {selectedRequest.phone && (
                  <div>
                    <p className="font-medium">Phone:</p>
                    <p className="text-gray-600">{selectedRequest.phone}</p>
                  </div>
                )}
                <div>
                  <p className="font-medium">Vehicle:</p>
                  <p className="text-gray-600">
                    {selectedRequest.carDetails.year} {selectedRequest.carDetails.make}{" "}
                    {selectedRequest.carDetails.model}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Mileage:</p>
                  <p className="text-gray-600">
                    {selectedRequest.carDetails.mileage?.toLocaleString()} km
                  </p>
                </div>
                <div>
                  <p className="font-medium">Condition:</p>
                  <p className="text-gray-600 capitalize">
                    {selectedRequest.carDetails.condition}
                  </p>
                </div>
              </div>

              <div>
                <p className="font-medium">Full Message:</p>
                <p className="text-gray-600 whitespace-pre-wrap">
                  {selectedRequest.message}
                </p>
              </div>

              <div className="mt-4 flex justify-end space-x-4">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}