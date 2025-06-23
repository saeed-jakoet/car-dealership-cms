"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { useForm } from "react-hook-form";
import { FiSave, FiXCircle, FiTrash2 } from "react-icons/fi";
import { useAuthPut, useAuthFetcher } from "@/utils/useAuthFetcher";

const carBrands = [
  "Acura", "Alfa Romeo", "Aston Martin", "Audi", "Bentley", "BMW", "Bugatti", "Buick",
  "Cadillac", "Chevrolet", "Chrysler", "Citroën", "Dacia", "Daewoo", "Daihatsu", "Dodge",
  "Donkervoort", "DS Automobiles", "Ferrari", "Fiat", "Fisker", "Ford", "Genesis", "GMC",
  "Great Wall", "Haval", "Holden", "Honda", "Hummer", "Hyundai", "Infiniti", "Isuzu", "Jaguar",
  "Jeep", "Kia", "Koenigsegg", "Lada", "Lamborghini", "Lancia", "Land Rover", "Lexus", "Lincoln",
  "Lotus", "Lucid", "Mahindra", "Maserati", "Maybach", "Mazda", "McLaren", "Mercedes-Benz",
  "Mercury", "Mini", "Mitsubishi", "Morgan", "Nissan", "Noble", "Opel", "Pagani", "Peugeot",
  "Polestar", "Pontiac", "Porsche", "Proton", "RAM", "Renault", "Rimac", "Rivian", "Rolls-Royce",
  "Rover", "Saab", "Saturn", "Scion", "SEAT", "Skoda", "Smart", "SsangYong", "Subaru", "Suzuki",
  "Tata", "Tesla", "Toyota", "Vauxhall", "Volkswagen", "Volvo", "Wiesmann", "Zotye",
];

const carBodyTypes = [
  "Sedan", "Hatchback", "SUV", "Coupe", "Convertible", "Wagon", "Pickup", "Van", "Minivan",
  "Crossover", "Roadster", "Sports Car", "Luxury Car", "Off-Road", "Microcar",
];

export default function EditCarPage() {
  const { id } = useParams();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      name: "",
      brand: "",
      price: "",
      year: "",
      mileage: "",
      fuelType: "",
      transmissionType: "",
      used: false,
      colour: "",
      bodyType: "",
      previousOwners: "",
      serviceHistory: "",
      warranty: "",
      extras: "",
      sellerComments: "",
    },
  });

  const [car, setCar] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [newImages, setNewImages] = useState([]);

  const authPut = useAuthPut();
  const authFetcher = useAuthFetcher();

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const data = await authFetcher(`/vehicles/${id}`);
        setCar(data);
        reset({
          name: data.name || "",
          brand: data.brand || "",
          price: data.price || "",
          year: String(data.year) || "",
          mileage: data.mileage || "",
          fuelType: data.fuelType || "",
          transmissionType: data.transmissionType || "",
          used: data.used || false,
          colour: data.vehicleDetails?.colour || "",
          bodyType: data.vehicleDetails?.bodyType || "",
          previousOwners: data.vehicleDetails?.previousOwners || "",
          serviceHistory: data.vehicleDetails?.serviceHistory || "",
          warranty: data.vehicleDetails?.warranty || "",
          extras: data.extras?.join(", ") || "",
          sellerComments: data.sellerComments || "",
        });
      } catch (err) {
        setError("Failed to load vehicle data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCar();
  }, [id]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setError("");
    try {
      const formattedData = {
        ...data,
        price: String(data.price),
        year: String(data.year),
        mileage: String(data.mileage),
        previousOwners: Number(data.previousOwners),
        extras: data.extras ? data.extras.split(",").map((e) => e.trim()) : [],
        vehicleDetails: {
          colour: data.colour,
          bodyType: data.bodyType,
          previousOwners: Number(data.previousOwners),
          serviceHistory: data.serviceHistory,
          warranty: data.warranty,
        },
      };

      await authPut(`/vehicles/edit/${id}`, formattedData);
      router.push(`/admin/cars/${id}`);
    } catch (err) {
      setError("Failed to update vehicle");
    } finally {
      setIsSubmitting(false);
    }
  };


  if (isLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-red-600 font-semibold">{error}</p>
        </div>
    );
  }

  return (
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 my-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">Edit Vehicle</h1>
          <div className="flex space-x-4">
            <button
                type="button"
                onClick={() => router.push(`/admin/cars/${id}`)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-700 cursor-pointer"
            >
              <FiXCircle />
              Cancel
            </button>
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-6">Add New Vehicle</h1>

        <form
            key={car ? car.id : "new"}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-10"
        >
          {/* Vehicle Information */}
          <fieldset className="border-b border-gray-200 pb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <legend className="text-xl font-semibold text-gray-700 mb-4 md:col-span-2">
              Vehicle Information
            </legend>

            {/* Vehicle Name */}
            <Input
                label="Vehicle Name"
                {...register("name", { required: "Name is required" })}
                error={errors.name}
            />

            {/* Brand Select */}
            <Select
                label="Brand"
                {...register("brand", { required: "Brand is required" })}
                options={carBrands}
                error={errors.brand}
                value={watch("brand")}
            />

            {/* Price */}
            <Input
                label="Price (ZAR)"
                type="number"
                {...register("price", {
                  required: "Price is required",
                  min: { value: 0, message: "Price must be positive" },
                })}
                error={errors.price}
            />

            {/* Year */}
            <Select
                label="Year"
                {...register("year", { required: "Year is required" })}
                options={Array.from({ length: 30 }, (_, i) => String(new Date().getFullYear() - i))}
                error={errors.year}
                value={watch("year")}
            />
          </fieldset>

          {/* Vehicle Details */}
          <fieldset className="border-b border-gray-200 pb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <legend className="text-xl font-semibold text-gray-700 mb-4 md:col-span-2">
              Vehicle Details
            </legend>

            {/* Mileage */}
            <Input
                label="Mileage (km)"
                type="number"
                {...register("mileage", {
                  required: "Mileage is required",
                  min: { value: 0, message: "Mileage must be positive" },
                })}
                error={errors.mileage}
            />

            {/* Fuel Type */}
            <Select
                label="Fuel Type"
                {...register("fuelType", { required: "Fuel type is required" })}
                options={["Petrol", "Diesel", "Electric", "Hybrid"]}
                error={errors.fuelType}
            />

            {/* Transmission */}
            <Select
                label="Transmission"
                {...register("transmissionType", { required: "Transmission is required" })}
                options={["Automatic", "Manual"]}
                error={errors.transmissionType}
            />

            {/* Used Checkbox */}
            <div className="flex items-center space-x-2 mt-4 md:mt-0">
              <input
                  type="checkbox"
                  {...register("used")}
                  id="usedCheckbox"
                  className="w-5 h-5 rounded border-gray-300 cursor-pointer"
              />
              <label htmlFor="usedCheckbox" className="text-gray-700 select-none cursor-pointer">
                Used Car
              </label>
            </div>
          </fieldset>

          {/* Additional Details */}
          <fieldset className="border-b border-gray-200 pb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <legend className="text-xl font-semibold text-gray-700 mb-4 md:col-span-2">
              Additional Details
            </legend>

            {/* Color */}
            <Input label="Color" {...register("colour")} />

            {/* Body Type */}
            <Select label="Body Type" {...register("bodyType")} options={carBodyTypes} />

            {/* Previous Owners */}
            <Input label="Previous Owners" type="number" {...register("previousOwners")} />

            {/* Warranty */}
            <Input label="Warranty" {...register("warranty")} />
          </fieldset>

          {/* Extras */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Extras (comma separated)</label>
            <input
                {...register("extras")}
                className="w-full rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-3 transition"
            />
          </div>

          {/* Seller Comments */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Seller Comments</label>
            <textarea
                {...register("sellerComments")}
                rows={4}
                className="w-full rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-3 transition resize-none"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-gray-700 font-semibold mb-3">Upload Images</label>
            <div className="flex items-center space-x-4">
              <label
                  htmlFor="imageUpload"
                  className="cursor-pointer inline-flex items-center px-5 py-3 bg-black text-white rounded-lg shadow hover:bg-gray-700 transition"
              >
                <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12v8m0-8l3-3m-3 3l-3-3"
                  />
                </svg>
                Choose Images
              </label>
              <input
                  id="imageUpload"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setNewImages(Array.from(e.target.files || []))}
                  className="hidden"
              />
            </div>

            {/* Preview new images */}
            {newImages.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-4">
                  {newImages.map((file, i) => (
                      <img
                          key={i}
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${i + 1}`}
                          className="w-24 h-24 object-cover rounded-lg border"
                      />
                  ))}
                </div>
            )}

            {/* Existing images */}
            {car?.images?.length > 0 && (
                <div className="mt-6">
                  <label className="block text-gray-700 font-semibold mb-2">Current Images</label>
                  <div className="flex flex-wrap gap-4">
                    {car.images.map((img, i) => (
                        <img
                            key={i}
                            src={img}
                            alt={`Current ${i + 1}`}
                            className="w-24 h-24 object-cover rounded-lg border"
                        />
                    ))}
                  </div>
                </div>
            )}
          </div>

          {/* Submit */}
          <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 rounded-lg bg-black text-white font-semibold shadow-md flex justify-center items-center transition cursor-pointer ${
                  isSubmitting ? "opacity-60 cursor-not-allowed" : "hover:bg-gray-800"
              }`}
          >
            {isSubmitting ? (
                <>
                  <svg
                      className="animate-spin h-5 w-5 mr-2 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                  >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Saving...
                </>
            ) : (
                <>
                  <FiSave className="mr-2" />
                  Save Changes
                </>
            )}
          </button>

          {error && <p className="text-red-600 text-center mt-4 font-semibold">{error}</p>}
        </form>
      </div>
  );
}

// Reusable Input Component with label, error handling
function Input({ label, error, ...props }) {
  return (
      <div>
        <label className="block text-gray-700 font-medium mb-1">{label}</label>
        <input
            {...props}
            className={`w-full rounded-lg border px-3 py-2 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                error ? "border-red-500" : "border-gray-300"
            }`}
        />
        {error && <p className="text-red-500 mt-1 text-sm">{error.message}</p>}
      </div>
  );
}

// Select component
function Select({ label, options, error, ...props }) {
  return (
      <div>
        <label className="block text-gray-700 font-medium mb-1">{label}</label>
        <select
            {...props}
            className={`w-full rounded-lg border px-3 py-2 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                error ? "border-red-500" : "border-gray-300"
            }`}
        >
          <option value=""></option>
          {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
          ))}
        </select>
        {error && <p className="text-red-500 mt-1 text-sm">{error.message}</p>}
      </div>
  );
}
