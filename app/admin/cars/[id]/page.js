'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiArrowLeft, FiEdit, FiTrash } from 'react-icons/fi';
import { ImageSlider, ConfirmModal } from '../../../components';
import { useAuthDelete, useAuthFetcher } from "../../../lib";
import Link from 'next/link';
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <Link href="/admin" className="mb-8 inline-flex items-center text-gray-600 hover:text-gray-900 font-medium transition-colors">
          <FiArrowLeft className="mr-2" />
          Back to List
        </Link>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-2xl font-medium text-gray-900 mb-2">{car.name}</h1>
                <div className="flex items-center gap-4 text-gray-600">
                  <span>{car.brand}</span>
                  <span>•</span>
                  <span>{car.year}</span>
                  <span>•</span>
                  <span>{car.fuelType}</span>
                  <span>•</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${car.used ? 'bg-gray-100 text-gray-700' : 'bg-gray-900 text-white'}`}>
                    {car.used ? 'Used' : 'New'}
                  </span>
                </div>
                <div className="mt-3">
                  <span className="text-xl font-semibold text-gray-900">R {car.price?.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/admin/cars/${id}/edit`)}
                  className="flex items-center px-3 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <FiEdit className="mr-1 w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => setShowConfirmModal(true)}
                  className="flex items-center px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FiTrash className="mr-1 w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>

          {/* Image Gallery */}
          <div className="mb-8">
            {car.images?.length > 0 ? (
              <ImageSlider images={car.images} />
            ) : (
              <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="text-lg">No images available</div>
                </div>
              </div>
            )}
          </div>


          {/* Vehicle Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Vehicle Details */}
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Details</h3>
                <div className="space-y-3">
                  <DetailItem label="Mileage" value={`${car.mileage?.toLocaleString()} km`} />
                  <DetailItem label="Transmission" value={car.transmissionType} />
                  <DetailItem label="Fuel Type" value={car.fuelType} />
                  <DetailItem label="Color" value={car.vehicleDetails?.colour} />
                  <DetailItem label="Body Type" value={car.vehicleDetails?.bodyType} />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">History & Ownership</h3>
                <div className="space-y-3">
                  <DetailItem label="Previous Owners" value={car.vehicleDetails?.previousOwners || 'N/A'} />
                  <DetailItem label="Service History" value={car.vehicleDetails?.serviceHistory || 'N/A'} />
                  <DetailItem label="Warranty" value={car.vehicleDetails?.warranty || 'No warranty'} />
                  <DetailItem label="Listed Date" value={new Date(car.createdAt).toLocaleDateString()} />
                </div>
              </div>
            </div>

            {/* Features & Comments */}
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Features & Extras</h3>
                {car.extras && car.extras.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {car.extras.map((extra, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">
                        {extra}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No additional features listed</p>
                )}
              </div>
              
              {car.sellerComments && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Seller Notes</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 leading-relaxed">
                      {car.sellerComments}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
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
    </div>
  );
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