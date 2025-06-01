"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { useForm } from "react-hook-form";
import { FiSave, FiXCircle, FiTrash2, FiUploadCloud } from "react-icons/fi";
import Cookies from "js-cookie";
import { useAuthPut, useAuthFetcher } from "@/utils/useAuthFetcher";

export default function EditCarPage() {
  const { id } = useParams();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();
  const [car, setCar] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [newImages, setNewImages] = useState([]);
  const authPut = useAuthPut();
  const fetcher = useAuthFetcher();


  useEffect(() => {
    const fetchCar = async () => {
      try {
        const data = await authFetcher(`/vehicles/${id}`);
        setCar(data);
        populateForm(data);
      } catch (err) {
        console.error("Error fetching vehicle:", err);
        setError("Failed to load vehicle data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCar();
  }, [id]);

  const populateForm = (carData) => {
    setValue("name", carData.name);
    setValue("brand", carData.brand);
    setValue("price", carData.price);
    setValue("year", carData.year);
    setValue("mileage", carData.mileage);
    setValue("fuelType", carData.fuelType);
    setValue("transmissionType", carData.transmissionType);
    setValue("used", carData.used);
    setValue("colour", carData.vehicleDetails?.colour);
    setValue("bodyType", carData.vehicleDetails?.bodyType);
    setValue("previousOwners", carData.vehicleDetails?.previousOwners);
    setValue("serviceHistory", carData.vehicleDetails?.serviceHistory);
    setValue("warranty", carData.vehicleDetails?.warranty);
    setValue("extras", carData.extras?.join(", "));
    setValue("sellerComments", carData.sellerComments);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const formattedData = {
        ...data,
        price: String(data.price),
        year: String(data.year),
        mileage: String(data.mileage),
        previousOwners: Number(data.previousOwners),
        extras: data.extras.split(",").map((e) => e.trim()),
        vehicleDetails: {
          colour: data.colour,
          bodyType: data.bodyType,
          previousOwners: Number(data.previousOwners),
          serviceHistory: data.serviceHistory,
          warranty: data.warranty,
        },
      };

      const response = await authPut(`/vehicles/edit/${id}`, formattedData);

      if (response) {
        router.push(`/admin/cars/${id}`);
      }
    } catch (err) {
      console.error("Update failed:", err);
      setError("Failed to update vehicle");
      router.push(`/admin/cars/${id}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this vehicle?")) {
      try {
        await axios.delete(`${BASE_URL}/vehicles/${id}`);
        router.push("/admin/cars");
      } catch (err) {
        console.error("Delete failed:", err);
        alert("Failed to delete vehicle");
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Edit Vehicle</h1>
          <div className="flex gap-4">
            <button
              onClick={() => router.push(`/admin/cars/${id}`)}
              className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              <FiXCircle className="mr-2" />
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <FiTrash2 className="mr-2" />
              Delete
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-xl shadow-md p-6 space-y-6"
        >
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Name
              </label>
              <input
                {...register("name", { required: "Name is required" })}
                className="w-full px-4 py-2 border rounded-lg"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand
              </label>
              <input
                {...register("brand", { required: "Brand is required" })}
                className="w-full px-4 py-2 border rounded-lg"
              />
              {errors.brand && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.brand.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (ZAR)
              </label>
              <input
                type="number"
                {...register("price", {
                  required: "Price is required",
                  min: 0,
                })}
                className="w-full px-4 py-2 border rounded-lg"
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.price.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year
              </label>
              <input
                type="number"
                {...register("year", {
                  required: "Year is required",
                  min: 1900,
                  max: new Date().getFullYear() + 1,
                })}
                className="w-full px-4 py-2 border rounded-lg"
              />
              {errors.year && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.year.message}
                </p>
              )}
            </div>
          </div>

          {/* Vehicle Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mileage (km)
              </label>
              <input
                type="number"
                {...register("mileage", {
                  required: "Mileage is required",
                  min: 0,
                })}
                className="w-full px-4 py-2 border rounded-lg"
              />
              {errors.mileage && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.mileage.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fuel Type
              </label>
              <select
                {...register("fuelType", { required: "Fuel type is required" })}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transmission
              </label>
              <select
                {...register("transmissionType", {
                  required: "Transmission is required",
                })}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condition
              </label>
              <select
                {...register("used")}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value={false}>New</option>
                <option value={true}>Used</option>
              </select>
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <input
                {...register("colour")}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Body Type
              </label>
              <input
                {...register("bodyType")}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Previous Owners
              </label>
              <input
                type="number"
                {...register("previousOwners")}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Warranty
              </label>
              <input
                {...register("warranty")}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
          </div>

          {/* Extras and Comments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Extras (comma separated)
            </label>
            <input
              {...register("extras")}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seller Comments
            </label>
            <textarea
              {...register("sellerComments")}
              rows="4"
              className="w-full px-4 py-2 border rounded-lg"
            ></textarea>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Images
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <FiUploadCloud className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                Drag and drop images here, or click to upload
              </p>
              <input
                type="file"
                multiple
                onChange={(e) => setNewImages([...e.target.files])}
                className="hidden"
                id="imageUpload"
              />
              <label
                htmlFor="imageUpload"
                className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
              >
                Upload Images
              </label>
              {newImages.length > 0 && (
                <p className="mt-2 text-sm text-gray-500">
                  {newImages.length} new image(s) selected
                </p>
              )}
            </div>
          </div>

          {/* Existing Images */}
          {car?.images?.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Images
              </label>
              <div className="grid grid-cols-3 gap-4">
                {car.images.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img}
                      alt={`Current ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              <FiSave className="mr-2" />
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>

          {error && <p className="text-red-500 text-center">{error}</p>}
        </form>
      </div>
    </div>
  );
}
