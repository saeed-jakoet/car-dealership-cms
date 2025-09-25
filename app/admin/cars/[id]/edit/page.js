"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { FiSave, FiXCircle} from "react-icons/fi";
import { useAuthPut, useAuthFetcher } from "@/app/lib";
import {toast} from "react-hot-toast";

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
  const [allImages, setAllImages] = useState([]);
  const [car, setCar] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [error, setError] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [pendingImages, setPendingImages] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [hasUploadedImages, setHasUploadedImages] = useState(false);

  const authPut = useAuthPut();
  const authFetcher = useAuthFetcher();

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


  useEffect(() => {
    if (car) {
      // Create a combined array of all image URLs
      const allUrls = car.allImageUrls || [];
      setAllImages(allUrls);
    }
  }, [car]);

  const handleImageShuffleSave = async () => {
    if (!car?._id || !car?.imagePublicIds) return;

    try {
      // Create mapping from URLs to their original indices based on car.allImageUrls
      const originalUrls = car.allImageUrls || [];
      const publicIds = car.imagePublicIds || [];
      
      // Map current order of URLs back to their publicIds
      const orderedPublicIds = allImages
        .map((imgUrl) => {
          const urlIndex = originalUrls.findIndex(url => url === imgUrl);
          return urlIndex !== -1 ? publicIds[urlIndex] : null;
        })
        .filter(id => id !== null);

      console.log('Sending publicIds:', orderedPublicIds);

      const updated = await authPut(`/vehicles/shuffle/${id}`, {
        publicIds: orderedPublicIds,
      });
      console.log('Shuffle response:', updated);

      if (updated && updated.error) {
        throw new Error(updated.error || "Failed to save image order");
      }

      toast.success("Image order saved successfully!");
      setCar(updated);
      
      // Update allImages with the new order from the response
      if (updated.allImageUrls) {
        setAllImages(updated.allImageUrls);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error while saving image order");
    }
  };

  const moveLeft = () => {
    if (selectedIndex === null || selectedIndex === 0) return;
    setAllImages(prev => {
      const newArr = [...prev];
      [newArr[selectedIndex - 1], newArr[selectedIndex]] = [newArr[selectedIndex], newArr[selectedIndex - 1]];
      setSelectedIndex(selectedIndex - 1);
      return newArr;
    });
  };

  const moveRight = () => {
    if (selectedIndex === null || selectedIndex === allImages.length - 1) return;
    setAllImages(prev => {
      const newArr = [...prev];
      [newArr[selectedIndex + 1], newArr[selectedIndex]] = [newArr[selectedIndex], newArr[selectedIndex + 1]];
      setSelectedIndex(selectedIndex + 1);
      return newArr;
    });
  };




  // When new files are selected (just store them, don't upload yet)
  const handleImageSelection = (files) => {
    if (!files || files.length === 0) return;
    
    const newFiles = Array.from(files).map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size
    }));
    
    setPendingImages(prev => [...prev, ...newFiles]);
    
    const totalSize = Array.from(files).reduce((sum, file) => sum + file.size, 0);
    const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(1);
    
    toast.success(`${files.length} image(s) selected (${totalSizeMB}MB). Click "Upload New Images" to add them.`);
    
    // Clear the file input
    const fileInput = document.getElementById("imageUpload");
    if (fileInput) fileInput.value = "";
  };

  // Actual upload function (called by button click)
  const handleImageUpload = async () => {
    if (pendingImages.length === 0) return;
    
    setIsUploadingImages(true);
    setUploadProgress(0);
    setError("");
    setHasUploadedImages(false);
    
    let progressInterval = null;
    
    try {
      const formData = new FormData();
      
      pendingImages.forEach((item) => {
        formData.append("file", item.file);
      });

      // Simple progress simulation that completes when API call finishes
      progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev < 90) {
            return prev + Math.random() * 5 + 2; // Steady progress to 90%
          }
          return prev; // Stop at 90% until API completes
        });
      }, 300);

      // Upload without timeout for large files
      console.log('Starting upload...');
      const response = await authPut(`/vehicles/images/${id}`, formData);
      console.log('Upload response received:', response);
      
      // Clear progress interval immediately when API call completes
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
      
      // Complete progress to 100%
      setUploadProgress(100);
      
      if (response && response.data) {
        console.log('Processing successful response...');
        // Update the car state with new image data
        setCar(response.data);
        toast.success(`${pendingImages.length} image(s) uploaded successfully!`);
        
        // Clear pending images and mark as uploaded
        setPendingImages([]);
        setHasUploadedImages(true);
        
        // Complete the upload state immediately
        setTimeout(() => {
          setIsUploadingImages(false);
          setUploadProgress(0);
        }, 1000);
        
      } else {
        throw new Error("Failed to upload images - no response data");
      }
    } catch (err) {
      console.error("Error uploading images:", err);
      
      // Clean up progress interval on error
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      
      const errorMessage = err.message.includes("timeout") 
        ? "Upload is taking too long. Please check your connection and try again."
        : "Failed to add images. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      setUploadProgress(0);
      setIsUploadingImages(false);
    }
  };

  // Remove a pending image
  const removePendingImage = (index) => {
    setPendingImages(prev => prev.filter((_, i) => i !== index));
  };


  useEffect(() => {
    const fetchCar = async () => {
      try {
        const data = await authFetcher(`/vehicles/${id}`);
        console.log('Fetched car data:', data);
        console.log('imagePublicIds:', data.imagePublicIds);
        console.log('allImageUrls:', data.allImageUrls);
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
      setHasUploadedImages(false); // Reset upload state
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

        <form
            key={car ? car.id : "new"}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-10"
        >
          {/* Vehicle Information */}
          <fieldset className="border-b border-gray-200 pb-6 grid grid-cols-1 md:grid-cols-2 gap-6">

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
          <div className={isUploadingImages ? "opacity-50 pointer-events-none" : ""}>
            <label className="block text-gray-700 font-semibold mb-3">Add More Images</label>
            <p className="text-sm text-gray-600 mb-3">
              Note: New images will be added to the existing images for this vehicle. Images will be uploaded with their original quality.
            </p>
            {/* Success notification when images are uploaded */}
            {hasUploadedImages && !isUploadingImages && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div className="text-green-700 text-sm">
                    <div className="font-medium">Images uploaded successfully!</div>
                    <div className="text-xs mt-1">You can now use "Save Changes" to save vehicle details, or add more images.</div>
                  </div>
                </div>
              </div>
            )}
            <div className="flex items-center space-x-4">
              <label
                  htmlFor="imageUpload"
                  className={`cursor-pointer inline-flex items-center px-5 py-3 bg-black text-white rounded-lg shadow hover:bg-gray-700 transition ${
                    isUploadingImages ? "opacity-50 cursor-not-allowed" : ""
                  }`}
              >
                {isUploadingImages ? (
                  <>
                    <svg
                        className="animate-spin h-5 w-5 mr-2"
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
                    Adding Images...
                  </>
                ) : (
                  <>
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
                    Select Images
                  </>
                )}
              </label>
              <input
                  id="imageUpload"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleImageSelection(e.target.files)}
                  className="hidden"
                  disabled={isUploadingImages}
              />
            </div>

            {/* Pending Images Preview */}
            {pendingImages.length > 0 && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-yellow-800">
                    Selected Images ({pendingImages.length}) - Ready to Upload
                  </h4>
                  <button
                    type="button"
                    onClick={() => setPendingImages([])}
                    className="text-yellow-600 hover:text-yellow-800 text-sm"
                  >
                    Clear All
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-3 mb-4">
                  {pendingImages.map((item, index) => (
                    <div key={index} className="relative">
                      <img
                        src={item.preview}
                        alt={`Pending ${index + 1}`}
                        className="w-20 h-20 object-cover rounded border border-yellow-300"
                      />
                      <button
                        type="button"
                        onClick={() => removePendingImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                      <div className="text-xs text-center mt-1 text-yellow-700">
                        {(item.size / (1024 * 1024)).toFixed(1)}MB
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Progress Bar */}
                {isUploadingImages && (
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-blue-700">
                        {uploadProgress < 30 ? 'Processing images...' : 
                         uploadProgress < 70 ? 'Uploading to cloud...' : 
                         uploadProgress < 95 ? 'Almost done...' : 'Finalizing...'}
                      </span>
                      <span className="text-sm font-semibold text-blue-600">{Math.round(uploadProgress)}%</span>
                    </div>
                    <div className="w-full bg-blue-100 rounded-full h-3 overflow-hidden shadow-inner">
                      <div 
                        className={`h-3 rounded-full transition-all duration-200 ease-out ${
                          uploadProgress >= 100 
                            ? 'bg-gradient-to-r from-green-500 to-green-600' 
                            : 'bg-gradient-to-r from-blue-500 to-blue-600'
                        }`}
                        style={{ 
                          width: `${uploadProgress}%`,
                          transition: 'width 0.2s ease-out, background-color 0.3s ease-in-out'
                        }}
                      ></div>
                    </div>
                    {uploadProgress > 90 && uploadProgress < 100 && (
                      <div className="text-xs text-blue-600 mt-1 text-center">
                        Processing final steps...
                      </div>
                    )}
                  </div>
                )}
                
                <button
                  type="button"
                  onClick={handleImageUpload}
                  disabled={isUploadingImages}
                  className={`w-full py-3 rounded-lg font-semibold transition ${
                    isUploadingImages 
                      ? "bg-gray-400 text-gray-600 cursor-not-allowed" 
                      : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                  }`}
                >
                  {isUploadingImages ? (
                    "Uploading..."
                  ) : (
                    `Upload ${pendingImages.length} Image(s)`
                  )}
                </button>
              </div>
            )}

            {/* Image Order (Click to select, use buttons to move) */}
            <div className="mt-6">
              <label className="block text-gray-700 font-semibold mb-2">Image Order (Select and reorder)</label>
              <div className="flex flex-wrap gap-4">
                {allImages.map((imgUrl, i) => (
                  <img
                      key={`${imgUrl}-${i}`}
                      src={imgUrl}
                      alt={`Image ${i + 1}`}
                      className={`w-24 h-24 object-cover rounded-lg border cursor-pointer select-none ${
                          i === selectedIndex ? "border-4 border-blue-500" : "border-gray-300"
                      }`}
                      onClick={() => setSelectedIndex(i)}
                  />
                ))}
              </div>

              {selectedIndex !== null && (
                  <div className="mt-6 flex items-center justify-center space-x-8">
                    <button
                        type="button"
                        onClick={() => {
                          if (selectedIndex > 0) {
                            setAllImages(prev => {
                              const newArr = [...prev];
                              [newArr[selectedIndex - 1], newArr[selectedIndex]] = [newArr[selectedIndex], newArr[selectedIndex - 1]];
                              setSelectedIndex(selectedIndex - 1);
                              return newArr;
                            });
                          }
                        }}
                        disabled={selectedIndex === 0}
                        className="flex items-center cursor-pointer  px-6 py-3 bg-gray-100 rounded-xl shadow-sm hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium text-gray-700"
                    >
                      Move Left
                    </button>

                    <button
                        type="button"
                        onClick={handleImageShuffleSave}
                        className="px-6 py-3 bg-blue-600 cursor-pointer text-white rounded-xl shadow-md hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-400 transition duration-300 font-semibold"
                    >
                      Save Image Order
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                          if (selectedIndex < allImages.length - 1) {
                            setAllImages(prev => {
                              const newArr = [...prev];
                              [newArr[selectedIndex + 1], newArr[selectedIndex]] = [newArr[selectedIndex], newArr[selectedIndex + 1]];
                              setSelectedIndex(selectedIndex + 1);
                              return newArr;
                            });
                          }
                        }}
                        disabled={selectedIndex === allImages.length - 1}
                        className="flex items-center cursor-pointer px-6 py-3 bg-gray-100 rounded-xl shadow-sm hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium text-gray-700"
                    >
                      Move Right
                    </button>

                  </div>
              )}
            </div>
          </div>


          {/* Submit */}
          <button
              type="submit"
              disabled={isSubmitting || isUploadingImages}
              className={`w-full py-3 rounded-lg bg-black text-white font-semibold shadow-md flex justify-center items-center transition cursor-pointer ${
                  isSubmitting || isUploadingImages ? "opacity-60 cursor-not-allowed" : "hover:bg-gray-800"
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
            ) : isUploadingImages ? (
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
                  Wait - Adding Images...
                </>
            ) : (
                <>
                  <FiSave className="mr-2" />
                  Save Changes
                </>
            )}
          </button>

          {isUploadingImages && (
            <p className="text-blue-600 text-center mt-2 text-sm">
              Please wait for image upload to complete before saving changes.
            </p>
          )}
          
          {hasUploadedImages && !isUploadingImages && (
            <p className="text-green-600 text-center mt-2 text-sm font-medium">
              ✓ Images uploaded! You can now save changes if needed.
            </p>
          )}

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
