'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiArrowLeft, FiEdit, FiTrash } from 'react-icons/fi';
import ImageSlider from '@/components/ImageSlider';
import Link from 'next/link';
import {useAuthDelete, useAuthFetcher} from "@/utils/useAuthFetcher";
import ConfirmModal from "@/utils/confirmModal"
import { toast } from "react-hot-toast";

export default function CarDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [car, setCar] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const authFetcher = useAuthFetcher();
  const authDelete = useAuthDelete();

  const TOAST_ID = "car-detail-action";

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const vehicleData = await authFetcher(`/vehicles/${id}`);
        const images = [
          vehicleData.imageUrl,
          ...(vehicleData.imageUrls || [])
        ].filter(url => url && url.trim() !== '');

        setCar({ ...vehicleData, images });
        setError('');
      } catch (err) {
        console.error('Error fetching vehicle:', err);
        setError('Failed to load vehicle details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCar();
  }, [id]);

  const deleteVehicle = async (id, router, authDelete) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await authDelete(`/vehicles/del/${id}`);
        router.push('/admin');
      } catch (err) {
        toast.error("Failed to remove vehicle ❌", {id: TOAST_ID});
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-lg">{error}</div>
      </div>
    );
  }

  if (!car) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
  <div className="max-w-7xl mx-auto">
    <Link href="/admin" className="mb-6 flex items-center text-gray-600 hover:text-gray-800">
      <FiArrowLeft className="mr-2" />
      Back to List
    </Link>
  </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          {/* Header Section */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{car.name}</h1>
              <p className="text-lg text-gray-600 mt-2">
                {car.brand} • {car.year} • {car.fuelType}
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => router.push(`/admin/cars/${id}/edit`)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                alt="Edit Vehicle"
              >
                <FiEdit />
              </button>

              <button
                  onClick={() => setShowConfirmModal(true)}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer"
                  alt="Delete Vehicle"
              >
                <FiTrash />
              </button>

            </div>
            <ConfirmModal
                open={showConfirmModal}
                title="Confirm Deletion"
                description="Are you sure you want to delete this vehicle? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                onCancel={() => setShowConfirmModal(false)}
                onConfirm={async () => {
                  setShowConfirmModal(false);
                  await deleteVehicle(id, router, authDelete);
                }}
            />
          </div>

          {/* Image Gallery */}
        <div className="mb-8">
          {car.images?.length > 0 ? (
            <>
              {/* Show slider if more than 4 images */}
              {car.images.length > 4 ? (
                <ImageSlider images={car.images} />
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {car.images.map((img, index) => (
                    <div key={index} className="relative h-48 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={img}
                        alt={`${car.name} - ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/placeholder.jpg';
                          e.target.alt = 'Image not available';
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
              No images available
            </div>
          )}
        </div>


          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Vehicle Information */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Vehicle Information</h2>
              <div className="space-y-3">
                <DetailItem label="Price" value={`R ${car.price?.toLocaleString()}`} />
                <DetailItem label="Mileage" value={`${car.mileage?.toLocaleString()} km`} />
                <DetailItem label="Transmission" value={car.transmissionType} />
                <DetailItem label="Color" value={car.vehicleDetails?.colour} />
                <DetailItem label="Body Type" value={car.vehicleDetails?.bodyType} />
              </div>
            </div>

            {/* History & Status */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">History & Status</h2>
              <div className="space-y-3">
                <DetailItem label="Vehicle Status" value={car.used ? 'Used' : 'New'} />
                <DetailItem label="Previous Owners" value={car.vehicleDetails?.previousOwners || 'N/A'} />
                <DetailItem label="Service History" value={car.vehicleDetails?.serviceHistory || 'N/A'} />
                <DetailItem label="Warranty" value={car.vehicleDetails?.warranty || 'No warranty'} />
                <DetailItem label="Listed Date" value={new Date(car.createdAt).toLocaleDateString()} />
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Additional Information</h2>
              <div className="space-y-3">
                <DetailItem label="Extras" value={car.extras?.join(', ') || 'None'} />
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Seller Comments:</p>
                  <p className="text-gray-600 text-sm whitespace-pre-line">
                    {car.sellerComments || 'No comments provided'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
}

function DetailItem({ label, value }) {
  return (
    <div className="flex justify-between items-start">
      <span className="text-sm font-medium text-gray-700">{label}:</span>
      <span className="text-sm text-gray-600 text-right">{value}</span>
    </div>
  );
}