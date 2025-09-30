"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { FiSave, FiXCircle, FiArrowLeft } from "react-icons/fi";
import { useAuthPut, useAuthFetcher } from "../../../../lib";
import { toast } from "react-hot-toast";
import CarForm from "../../../../components/features/vehicles/CarForm";

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
  const [isDeletionMode, setIsDeletionMode] = useState(false);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const dragIndexRef = useRef(null);

  const authPut = useAuthPut();
  const authFetcher = useAuthFetcher();

  useEffect(() => {
    if (car) {
      // Create a combined array of all image URLs
      const allUrls = car.allImageUrls || [];
      setAllImages(allUrls);
    }
  }, [car]);

  const handleImageDeletion = async () => {
    if (!car?._id || imagesToDelete.length === 0) {
      toast.error("Please select images to delete");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Get the public IDs for the selected images
      const originalUrls = car.allImageUrls || [];
      const publicIds = car.imagePublicIds || [];
      
      const publicIdsToDelete = imagesToDelete.map(imgUrl => {
        const urlIndex = originalUrls.findIndex(url => url === imgUrl);
        return urlIndex !== -1 ? publicIds[urlIndex] : null;
      }).filter(id => id !== null);

      if (publicIdsToDelete.length === 0) {
        toast.error("No valid images selected for deletion");
        return;
      }

      // Send deletion request to the server
      const response = await authPut(`/vehicles/edit/${id}`, {
        imagesToDelete: publicIdsToDelete
      });

      if (response && response.data) {
        setCar(response.data);
        setImagesToDelete([]);
        setIsDeletionMode(false);
        toast.success(`${publicIdsToDelete.length} image(s) deleted successfully!`);
      }
    } catch (error) {
      console.error("Error deleting images:", error);
      toast.error("Failed to delete images. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleImageSelection = (imgUrl) => {
    if (imagesToDelete.includes(imgUrl)) {
      setImagesToDelete(imagesToDelete.filter(url => url !== imgUrl));
    } else {
      setImagesToDelete([...imagesToDelete, imgUrl]);
    }
  };

  const handleImageShuffleSave = async () => {
    if (!car?._id || !car?.imagePublicIds) return;

    try {
      // Create mapping from URLs to their original indices based on car.allImageUrls
      const originalUrls = car.allImageUrls || [];
      const publicIds = car.imagePublicIds || [];

      // Map current order of URLs back to their publicIds
      const orderedPublicIds = allImages
        .map((imgUrl) => {
          const urlIndex = originalUrls.findIndex((url) => url === imgUrl);
          return urlIndex !== -1 ? publicIds[urlIndex] : null;
        })
        .filter((id) => id !== null);

      const updated = await authPut(`/vehicles/shuffle/${id}`, {
        publicIds: orderedPublicIds,
      });

      if (updated && updated.error) {
        throw new Error(updated.error || "Failed to save image order");
      }

      const updatedCar = updated?.data || updated;
      toast.success("Image order saved successfully!");
      setCar(updatedCar);

      // Update allImages with the new order from the response
      if (updatedCar?.allImageUrls) {
        setAllImages(updatedCar.allImageUrls);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error while saving image order");
    }
  };

  const moveLeft = () => {
    if (selectedIndex === null || selectedIndex === 0) return;
    setAllImages((prev) => {
      const newArr = [...prev];
      [newArr[selectedIndex - 1], newArr[selectedIndex]] = [
        newArr[selectedIndex],
        newArr[selectedIndex - 1],
      ];
      setSelectedIndex(selectedIndex - 1);
      return newArr;
    });
  };

  const moveRight = () => {
    if (selectedIndex === null || selectedIndex === allImages.length - 1)
      return;
    setAllImages((prev) => {
      const newArr = [...prev];
      [newArr[selectedIndex + 1], newArr[selectedIndex]] = [
        newArr[selectedIndex],
        newArr[selectedIndex + 1],
      ];
      setSelectedIndex(selectedIndex + 1);
      return newArr;
    });
  };

  // Drag & Drop handlers for more intuitive reordering
  const handleDragStart = (index) => {
    dragIndexRef.current = index;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (dropIndex) => {
    const fromIndex = dragIndexRef.current;
    if (
      fromIndex === null ||
      fromIndex === undefined ||
      fromIndex === dropIndex
    )
      return;
    setAllImages((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(dropIndex, 0, moved);
      setSelectedIndex(dropIndex);
      return updated;
    });
    dragIndexRef.current = null;
  };

  const moveToFirst = () => {
    if (selectedIndex === null || selectedIndex === 0) return;
    setAllImages((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(selectedIndex, 1);
      updated.unshift(moved);
      setSelectedIndex(0);
      return updated;
    });
  };

  const moveToLast = () => {
    if (selectedIndex === null || selectedIndex === allImages.length - 1)
      return;
    setAllImages((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(selectedIndex, 1);
      updated.push(moved);
      setSelectedIndex(updated.length - 1);
      return updated;
    });
  };

  // When new files are selected (just store them, don't upload yet)
  const handleImageSelection = (files) => {
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
    }));

    setPendingImages((prev) => [...prev, ...newFiles]);

    const totalSize = Array.from(files).reduce(
      (sum, file) => sum + file.size,
      0
    );
    const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(1);

    toast.success(
      `${files.length} image(s) selected (${totalSizeMB}MB). Click "Upload New Images" to add them.`
    );

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
        setUploadProgress((prev) => {
          if (prev < 90) {
            return prev + Math.random() * 5 + 2; // Steady progress to 90%
          }
          return prev; // Stop at 90% until API completes
        });
      }, 300);

      // Upload without timeout for large files
      const response = await authPut(`/vehicles/images/${id}`, formData);

      // Clear progress interval immediately when API call completes
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }

      // Complete progress to 100%
      setUploadProgress(100);

      if (response && response.data) {
        // Update the car state with new image data
        setCar(response.data);
        toast.success(
          `${pendingImages.length} image(s) uploaded successfully!`
        );

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
    setPendingImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle CarForm submission
  const handleCarFormSubmit = async (formData) => {
    setIsSubmitting(true);
    setError("");
    try {
      // Convert FormData to regular object for edit mode
      const data = {};
      for (const [key, value] of formData.entries()) {
        if (key === "vehicleDetails") {
          data.vehicleDetails = JSON.parse(value);
        } else if (key === "extras") {
          data.extras = JSON.parse(value);
        } else {
          data[key] = value;
        }
      }

      const formattedData = {
        name: data.name,
        used: data.used === "true",
        mileage: String(data.mileage),
        transmissionType: data.transmissionType,
        price: String(data.price),
        fuelType: data.fuelType,
        year: String(data.year),
        brand: data.brand,
        sellerComments: data.sellerComments || "",
        extras: data.extras || [],
        vehicleDetails: {
          previousOwners: parseInt(data.vehicleDetails?.previousOwners) || 0,
          serviceHistory: data.vehicleDetails?.serviceHistory || "",
          colour: data.vehicleDetails?.colour || "",
          bodyType: data.vehicleDetails?.bodyType || "",
          warranty: data.vehicleDetails?.warranty || "",
        },
      };

      await authPut(`/vehicles/edit/${id}`, formattedData);
      setHasUploadedImages(false); // Reset upload state
      router.push(`/admin/cars/${id}`);
    } catch (err) {
      console.error("Edit form error:", err);
      setError("Failed to update vehicle");
      throw err; // Let CarForm handle the error display
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const data = await authFetcher(`/vehicles/${id}`);
        setCar(data);
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
      <div className="space-y-8">
        <CarForm
          initialData={car}
          onSubmit={handleCarFormSubmit}
          isSubmitting={isSubmitting}
          submitButtonText="Save Changes"
          showCancelButton={true}
          onCancel={() => router.push(`/admin/cars/${id}`)}
          showImageUpload={false}
          isEditMode={true}
        />

        {/* Image Upload and Management - Keep existing functionality */}
        <div
          className={isUploadingImages ? "opacity-50 pointer-events-none" : ""}
        >
          <label className="block text-gray-700 font-semibold mb-3">
            Add More Images
          </label>
          <p className="text-sm text-gray-600 mb-3">
            Note: New images will be added to the existing images for this
            vehicle. Images will be uploaded with their original quality.
          </p>
          {/* Success notification when images are uploaded */}
          {hasUploadedImages && !isUploadingImages && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-green-600 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="text-green-700 text-sm">
                  <div className="font-medium">
                    Images uploaded successfully!
                  </div>
                  <div className="text-xs mt-1">
                    You can now use &quot;Save Changes&quot; to save vehicle
                    details, or add more images.
                  </div>
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
                      {uploadProgress < 30
                        ? "Processing images..."
                        : uploadProgress < 70
                        ? "Uploading to cloud..."
                        : uploadProgress < 95
                        ? "Almost done..."
                        : "Finalizing..."}
                    </span>
                    <span className="text-sm font-semibold text-blue-600">
                      {Math.round(uploadProgress)}%
                    </span>
                  </div>
                  <div className="w-full bg-blue-100 rounded-full h-3 overflow-hidden shadow-inner">
                    <div
                      className={`h-3 rounded-full transition-all duration-200 ease-out ${
                        uploadProgress >= 100
                          ? "bg-gradient-to-r from-green-500 to-green-600"
                          : "bg-gradient-to-r from-blue-500 to-blue-600"
                      }`}
                      style={{
                        width: `${uploadProgress}%`,
                        transition:
                          "width 0.2s ease-out, background-color 0.3s ease-in-out",
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
                {isUploadingImages
                  ? "Uploading..."
                  : `Upload ${pendingImages.length} Image(s)`}
              </button>
            </div>
          )}

          {/* Image Order (Click to select, use buttons to move) */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  {isDeletionMode ? "Delete Images" : "Image Order"}
                </label>
                <p className="text-xs text-gray-500">
                  {isDeletionMode 
                    ? "Click images to select for deletion, then delete selected."
                    : "Drag and drop to reorder, then save."}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsDeletionMode(!isDeletionMode);
                    setImagesToDelete([]);
                    setSelectedIndex(null);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    isDeletionMode
                      ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      : "bg-red-100 text-red-700 hover:bg-red-200"
                  }`}
                >
                  {isDeletionMode ? "Cancel Delete" : "Delete Images"}
                </button>
              </div>
            </div>
            
            {isDeletionMode && imagesToDelete.length > 0 && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm font-medium">
                  {imagesToDelete.length} image(s) selected for deletion
                </p>
                <button
                  type="button"
                  onClick={() => setImagesToDelete([])}
                  className="text-red-600 hover:text-red-800 text-sm mt-1"
                >
                  Clear selection
                </button>
              </div>
            )}
            
            <div className="flex flex-wrap gap-4">
              {allImages.map((imgUrl, i) => (
                <div
                  key={`${imgUrl}-${i}`}
                  className={`relative group rounded-lg border transition ${
                    isDeletionMode
                      ? imagesToDelete.includes(imgUrl)
                        ? "border-red-500 ring-2 ring-red-200 bg-red-50"
                        : "border-gray-300 hover:border-red-300"
                      : i === selectedIndex
                      ? "border-blue-500 ring-2 ring-blue-200"
                      : "border-gray-300"
                  }`}
                  draggable={!isDeletionMode}
                  onDragStart={!isDeletionMode ? () => handleDragStart(i) : undefined}
                  onDragOver={!isDeletionMode ? handleDragOver : undefined}
                  onDrop={!isDeletionMode ? () => handleDrop(i) : undefined}
                  onClick={() => {
                    if (isDeletionMode) {
                      toggleImageSelection(imgUrl);
                    } else {
                      setSelectedIndex(i);
                    }
                  }}
                  title={isDeletionMode ? "Click to select for deletion" : "Drag to reorder"}
                >
                  <img
                    src={imgUrl}
                    alt={`Image ${i + 1}`}
                    className={`w-24 h-24 object-cover rounded-lg select-none ${
                      isDeletionMode ? "cursor-pointer" : "cursor-move"
                    } ${imagesToDelete.includes(imgUrl) ? "opacity-60" : ""}`}
                  />
                  <span className={`absolute top-1 left-1 text-[10px] px-1.5 py-0.5 rounded text-white ${
                    isDeletionMode && imagesToDelete.includes(imgUrl) 
                      ? "bg-red-600" 
                      : "bg-black/70"
                  }`}>
                    {isDeletionMode && imagesToDelete.includes(imgUrl) ? "✓" : i + 1}
                  </span>
                  {isDeletionMode && (
                    <div className={`absolute inset-0 rounded-lg flex items-center justify-center ${
                      imagesToDelete.includes(imgUrl) 
                        ? "bg-red-500/20" 
                        : "bg-transparent group-hover:bg-red-500/10"
                    }`}>
                      {imagesToDelete.includes(imgUrl) && (
                        <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-center">
              {isDeletionMode ? (
                <button
                  type="button"
                  onClick={handleImageDeletion}
                  disabled={imagesToDelete.length === 0 || isSubmitting}
                  className={`px-5 py-2 rounded-lg shadow-md font-semibold transition ${
                    imagesToDelete.length === 0 || isSubmitting
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-400"
                  }`}
                >
                  {isSubmitting ? "Deleting..." : `Delete ${imagesToDelete.length} Selected Image(s)`}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleImageShuffleSave}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-400 transition font-semibold"
                >
                  Save Image Order
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || isUploadingImages}
          className={`w-full py-3 rounded-lg bg-black text-white font-semibold shadow-md flex justify-center items-center transition cursor-pointer ${
            isSubmitting || isUploadingImages
              ? "opacity-60 cursor-not-allowed"
              : "hover:bg-gray-800"
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

        {error && (
          <p className="text-red-600 text-center mt-4 font-semibold">{error}</p>
        )}
      </div>
    </div>
  );
}
