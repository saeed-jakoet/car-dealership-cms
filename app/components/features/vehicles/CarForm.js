"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

export const carBrands = [
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

export const carBodyTypes = [
  "Sedan", "Hatchback", "SUV", "Coupe", "Convertible", "Wagon", "Pickup", "Van", "Minivan",
  "Crossover", "Roadster", "Sports Car", "Luxury Car", "Off-Road", "Microcar",
];

export default function CarForm({
  initialData = null,
  onSubmit,
  isSubmitting = false,
  submitButtonText = "Save Vehicle",
  showCancelButton = false,
  onCancel,
  isEditMode = false,
  showImageUpload = false
}) {
  const [selectedImages, setSelectedImages] = useState([]);
  const {
    register,
    handleSubmit,
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
    }
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || "",
        brand: initialData.brand || "",
        price: initialData.price || "",
        year: String(initialData.year) || "",
        mileage: initialData.mileage || "",
        fuelType: initialData.fuelType || "",
        transmissionType: initialData.transmissionType || "",
        used: initialData.used || false,
        colour: initialData.vehicleDetails?.colour || "",
        bodyType: initialData.vehicleDetails?.bodyType || "",
        previousOwners: initialData.vehicleDetails?.previousOwners || "",
        serviceHistory: initialData.vehicleDetails?.serviceHistory || "",
        warranty: initialData.vehicleDetails?.warranty || "",
        extras: initialData.extras?.join(", ") || "",
        sellerComments: initialData.sellerComments || "",
      });
    }
  }, [initialData, reset]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(files);
  };

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const onFormSubmit = async (data) => {
    try {
      // Create FormData for multipart form submission
      const formData = new FormData();
      
      // Add regular form fields
      Object.keys(data).forEach(key => {
        if (key === 'extras') {
          formData.append(key, JSON.stringify(data[key].split(',').map(s => s.trim()).filter(s => s)));
        } else if (['colour', 'bodyType', 'previousOwners', 'serviceHistory', 'warranty'].includes(key)) {
          // These go into vehicleDetails
          if (!formData.has('vehicleDetails')) {
            formData.append('vehicleDetails', JSON.stringify({}));
          }
          const vehicleDetails = JSON.parse(formData.get('vehicleDetails') || '{}');
          vehicleDetails[key] = data[key];
          formData.set('vehicleDetails', JSON.stringify(vehicleDetails));
        } else {
          formData.append(key, data[key]);
        }
      });
      
      // Add images if any
      if (showImageUpload && selectedImages.length > 0) {
        selectedImages.forEach(image => {
          formData.append('file', image);
        });
      }
      
      await onSubmit(formData);
      if (!isEditMode) {
        toast.success("Vehicle saved successfully!");
        reset();
        setSelectedImages([]);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to save vehicle");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {isEditMode ? "Edit Vehicle" : "Add New Vehicle"}
          </h2>
          <div className="w-16 h-0.5 bg-gray-900 mx-auto"></div>
        </div>

        {/* Basic Information */}
        <div className="bg-white border border-gray-100 rounded-lg p-8 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-6 pb-3 border-b border-gray-100">
            Basic Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Vehicle Name"
              {...register("name", { required: "Vehicle name is required" })}
              error={errors.name}
              placeholder="BMW 3 Series 320i"
            />

            <Select
              label="Brand"
              {...register("brand", { required: "Brand is required" })}
              options={carBrands}
              error={errors.brand}
            />

            <Input
              label="Price (ZAR)"
              type="number"
              {...register("price", {
                required: "Price is required",
                min: { value: 0, message: "Price must be positive" },
              })}
              error={errors.price}
              placeholder="250000"
            />

            <Select
              label="Year"
              {...register("year", { required: "Year is required" })}
              options={Array.from({ length: 30 }, (_, i) => String(new Date().getFullYear() - i))}
              error={errors.year}
            />
          </div>
        </div>

        {/* Technical Details */}
        <div className="bg-white border border-gray-100 rounded-lg p-8 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-6 pb-3 border-b border-gray-100">
            Technical Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Mileage (km)"
              type="number"
              {...register("mileage", {
                required: "Mileage is required",
                min: { value: 0, message: "Mileage must be positive" },
              })}
              error={errors.mileage}
              placeholder="50000"
            />

            <Select
              label="Fuel Type"
              {...register("fuelType", { required: "Fuel type is required" })}
              options={["Petrol", "Diesel", "Electric", "Hybrid"]}
              error={errors.fuelType}
            />

            <Select
              label="Transmission"
              {...register("transmissionType", { required: "Transmission is required" })}
              options={["Automatic", "Manual"]}
              error={errors.transmissionType}
            />

            <Input 
              label="Color" 
              {...register("colour", { required: "Color is required" })} 
              error={errors.colour}
              placeholder="Metallic Blue"
            />

            <Select 
              label="Body Type" 
              {...register("bodyType", { required: "Body type is required" })} 
              options={carBodyTypes} 
              error={errors.bodyType}
            />

            <Input 
              label="Previous Owners" 
              type="number" 
              {...register("previousOwners", { required: "Number of previous owners is required" })} 
              error={errors.previousOwners}
              placeholder="1"
            />

            <Select
              label="Warranty"
              {...register("warranty", { required: "Warranty information is required" })}
              options={["Yes", "No"]}
              error={errors.warranty}
            />

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                {...register("used")}
                className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900 focus:ring-2"
              />
              <label className="text-sm font-medium text-gray-700">
                Used Vehicle
              </label>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white border border-gray-100 rounded-lg p-8 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-6 pb-3 border-b border-gray-100">
            Additional Information
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Extras
                <span className="text-gray-500 font-normal ml-1">(comma separated)</span>
              </label>
              <input
                {...register("extras")}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 text-sm"
                placeholder="Air conditioning, leather seats, sunroof, navigation system..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seller Comments
              </label>
              <textarea
                {...register("sellerComments")}
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 resize-none text-sm"
                placeholder="Additional details about the vehicle's condition, history, or special features..."
              />
            </div>
          </div>
        </div>

        {/* Image Upload */}
        {showImageUpload && (
          <div className="bg-white border border-gray-100 rounded-lg p-8 shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-6 pb-3 border-b border-gray-100">
              Vehicle Images
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Images
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Select multiple images for the vehicle
                </p>
              </div>
              
              {/* Image Previews */}
              {selectedImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {selectedImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Submit Section */}
        <div className="flex justify-end space-x-4 pt-6">
          {showCancelButton && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all duration-200 font-medium"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 ${
              isSubmitting 
                ? "bg-gray-400 text-white cursor-not-allowed" 
                : "bg-gray-900 text-white hover:bg-gray-800"
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin h-4 w-4 mr-2"
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
              </span>
            ) : (
              submitButtonText
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// Helper Components
const Input = ({ label, error, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <input
      {...props}
      className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
        error
          ? "border-red-300 bg-red-50"
          : "border-gray-200 hover:border-gray-300"
      }`}
    />
    {error && (
      <p className="text-red-600 text-xs mt-1 font-medium">
        {error.message}
      </p>
    )}
  </div>
);

const Select = ({ label, options, error, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <select
      {...props}
      className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white ${
        error
          ? "border-red-300 bg-red-50"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <option value="">Select {label.toLowerCase()}...</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
    {error && (
      <p className="text-red-600 text-xs mt-1 font-medium">
        {error.message}
      </p>
    )}
  </div>
);
