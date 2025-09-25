"use client";
import { useState } from "react";
import { useAuthPost } from "@/app/lib";

const carBrands = [
  "Acura",
  "Alfa Romeo",
  "Aston Martin",
  "Audi",
  "Bentley",
  "BMW",
  "Bugatti",
  "Buick",
  "Cadillac",
  "Chevrolet",
  "Chrysler",
  "Citroën",
  "Dacia",
  "Daewoo",
  "Daihatsu",
  "Dodge",
  "Donkervoort",
  "DS Automobiles",
  "Ferrari",
  "Fiat",
  "Fisker",
  "Ford",
  "Genesis",
  "GMC",
  "Great Wall",
  "Haval",
  "Holden",
  "Honda",
  "Hummer",
  "Hyundai",
  "Infiniti",
  "Isuzu",
  "Jaguar",
  "Jeep",
  "Kia",
  "Koenigsegg",
  "Lada",
  "Lamborghini",
  "Lancia",
  "Land Rover",
  "Lexus",
  "Lincoln",
  "Lotus",
  "Lucid",
  "Mahindra",
  "Maserati",
  "Maybach",
  "Mazda",
  "McLaren",
  "Mercedes-Benz",
  "Mercury",
  "Mini",
  "Mitsubishi",
  "Morgan",
  "Nissan",
  "Noble",
  "Opel",
  "Pagani",
  "Peugeot",
  "Polestar",
  "Pontiac",
  "Porsche",
  "Proton",
  "RAM",
  "Renault",
  "Rimac",
  "Rivian",
  "Rolls-Royce",
  "Rover",
  "Saab",
  "Saturn",
  "Scion",
  "SEAT",
  "Skoda",
  "Smart",
  "SsangYong",
  "Subaru",
  "Suzuki",
  "Tata",
  "Tesla",
  "Toyota",
  "Vauxhall",
  "Volkswagen",
  "Volvo",
  "Wiesmann",
  "Zotye",
];

const carBodyTypes = [
  "Sedan",
  "Hatchback",
  "SUV",
  "Coupe",
  "Convertible",
  "Wagon",
  "Pickup",
  "Van",
  "Minivan",
  "Crossover",
  "Roadster",
  "Sports Car",
  "Luxury Car",
  "Off-Road",
  "Microcar",
];

const INITIAL_STATE = {
  name: "",
  used: false,
  mileage: "",
  transmissionType: "",
  price: "",
  fuelType: "",
  year: "",
  brand: "",
  imageUrl: "",
  imageUrls: [""],
  extras: [""],
  sellerComments: "",
  vehicleDetails: {
    previousOwners: 1,
    serviceHistory: "",
    colour: "",
    bodyType: "",
    warranty: "",
  },
  imageFiles: [],
};

export default function CarForm() {
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const authPost = useAuthPost();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes("vehicleDetails.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        vehicleDetails: { ...prev.vehicleDetails, [key]: value },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleArrayChange = (name, index, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: prev[name].map((item, i) => (i === index ? value : item)),
    }));
  };

  const addArrayItem = (name) => {
    setFormData((prev) => ({
      ...prev,
      [name]: [...prev[name], ""],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const form = new FormData();

      form.append("name", formData.name);
      form.append("used", String(formData.used));
      form.append("mileage", formData.mileage);
      form.append("transmissionType", formData.transmissionType);
      form.append("price", formData.price);
      form.append("fuelType", formData.fuelType);
      form.append("year", formData.year);
      form.append("brand", formData.brand);
      form.append("imageUrl", formData.imageUrl);
      form.append("sellerComments", formData.sellerComments);

      // Append arrays
      (formData.imageUrls || []).forEach((url, idx) => {
        form.append(`imageUrls[${idx}]`, url);
      });

      form.append("extras", JSON.stringify(formData.extras));

      // Append nested object as JSON
      form.append("vehicleDetails", JSON.stringify(formData.vehicleDetails));

      // Append image files
      (formData.imageFiles || []).forEach((file) => {
        form.append("file", file);
      });

      // Optionally, append a folder name
      form.append("folder", formData.name);

      const res = await authPost("/vehicles/new", form, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      setSuccessMsg("Vehicle added successfully!");
      setFormData(INITIAL_STATE);
    } catch (err) {
      console.error("Failed to submit vehicle:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {successMsg && (
        <div className="mb-6 p-4 rounded-lg bg-green-100 text-green-800 font-semibold text-center border border-green-300">
          {successMsg}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 space-y-10"
      >
        {/* Vehicle Basic Info */}
        <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-gray-200 pb-6">
          <legend className="text-xl font-semibold text-gray-700 mb-4">
            Vehicle Information
          </legend>

          <Input
            label="Vehicle Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brand
            </label>
            <select
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-black transition"
              required
            >
              <option value=""></option>
              {carBrands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Price (ZAR)"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <select
              name="year"
              value={formData.year}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            >
              <option value=""></option>
              {Array.from({ length: 30 }, (_, i) => {
                const year = new Date().getFullYear() - i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>

          <Input
            label="Mileage (km)"
            name="mileage"
            value={formData.mileage}
            onChange={handleChange}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fuel Type
            </label>
            <div className="flex gap-6">
              {["Petrol", "Diesel"].map((fuel) => (
                <label key={fuel} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="fuelType"
                    value={fuel}
                    checked={formData.fuelType === fuel}
                    onChange={handleChange}
                    className="text-blue-600 cursor-pointer"
                  />
                  {fuel}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transmission
            </label>
            <div className="flex gap-6">
              {["Manual", "Automatic"].map((trans) => (
                <label key={trans} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="transmissionType"
                    value={trans}
                    checked={formData.transmissionType === trans}
                    onChange={handleChange}
                    className="text-blue-600 cursor-pointer"
                  />
                  {trans}
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="used"
              id="usedCheckbox"
              checked={formData.used}
              onChange={handleChange}
              className="w-5 h-5 text-blue-600 rounded border-gray-300 cursor-pointer"
            />
            <label
              htmlFor="usedCheckbox"
              className="text-sm font-medium text-gray-700 cursor-pointer"
            >
              Used Car
            </label>
          </div>
        </fieldset>

        {/* Extras */}
        <fieldset className="border-b border-gray-200 pb-6 space-y-3">
          <legend className="text-xl font-semibold text-gray-700">
            Extras
          </legend>

          {formData.extras.map((extra, idx) => (
            <input
              key={idx}
              type="text"
              value={extra}
              onChange={(e) => handleArrayChange("extras", idx, e.target.value)}
              className="w-full rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition p-2"
              placeholder={`Extra Feature ${idx + 1}`}
            />
          ))}
          <button
            type="button"
            onClick={() => addArrayItem("extras")}
            className="text-black-600 text-sm hover:underline cursor-pointer"
          >
            + Add Extra
          </button>
        </fieldset>

        {/* Seller Comments */}
        <fieldset className="border-b border-gray-200 pb-6">
          <legend className="text-xl font-semibold text-gray-700 mb-3">
            Seller Comments
          </legend>
          <textarea
            name="sellerComments"
            value={formData.sellerComments}
            onChange={handleChange}
            rows={4}
            placeholder="Describe the car, condition, highlights, etc."
            className="w-full rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition p-3 resize-none"
          />
        </fieldset>

        {/* Vehicle Details */}
        <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <legend className="text-xl font-semibold text-gray-700 mb-4 md:col-span-2">
            Vehicle Details
          </legend>

          <Input
            label="Previous Owners"
            name="vehicleDetails.previousOwners"
            type="number"
            value={formData.vehicleDetails.previousOwners}
            onChange={handleChange}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service History
            </label>
            <div className="flex gap-6">
              {["Yes", "No"].map((val) => (
                <label
                  key={val}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="vehicleDetails.serviceHistory"
                    value={val}
                    checked={formData.vehicleDetails.serviceHistory === val}
                    onChange={handleChange}
                    className="text-blue-600"
                  />
                  {val}
                </label>
              ))}
            </div>
          </div>

          <Input
            label="Colour"
            name="vehicleDetails.colour"
            value={formData.vehicleDetails.colour}
            onChange={handleChange}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Body Type
            </label>
            <select
              name="vehicleDetails.bodyType"
              value={formData.vehicleDetails.bodyType}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              required
            >
              <option value=""></option>
              {carBodyTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Warranty
            </label>
            <div className="flex gap-8">
              {["Has Warranty", "No Warranty"].map((val) => (
                <label key={val} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="vehicleDetails.warranty"
                    value={val}
                    checked={formData.vehicleDetails.warranty === val}
                    onChange={handleChange}
                    className="text-blue-600 cursor-pointer"
                  />
                  {val}
                </label>
              ))}
            </div>
          </div>
        </fieldset>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Images
          </label>
          <div className="flex items-center space-x-4">
            <label
              htmlFor="imageUpload"
              className="cursor-pointer inline-flex items-center px-4 py-2 bg-black text-white rounded-lg shadow hover:bg-gray-700 transition"
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
                  d="M4 16v2a2 2 0 002 2h12a2 0 002-2v-2M12 12v8m0-8l3-3m-3 3l-3-3"
                ></path>
              </svg>
              Choose Images
            </label>
            <input
              id="imageUpload"
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setFormData((prev) => ({
                  ...prev,
                  imageFiles: [...prev.imageFiles, ...files],
                }));
              }}
              className="hidden"
            />
            {formData.imageFiles && formData.imageFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.imageFiles.map((file, idx) => (
                  <img
                    key={idx}
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${idx + 1}`}
                    className="w-20 h-20 object-cover rounded border"
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <button
            type="submit"
            disabled={loading}
            className={`w-full bg-black hover:bg-gray-700 transition text-white font-semibold py-3 rounded-lg shadow-md cursor-pointer flex items-center justify-center ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                Saving...
              </>
          ) : (
              "Save Vehicle"
          )}
        </button>
      </form>
    </>
  );
}

export function Input({ label, name, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      />
    </div>
  );
}