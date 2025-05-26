"use client";
import axios from "axios";
import { useState, useEffect } from "react";
import {
  FiDroplet,
  FiMapPin,
  FiCalendar,
  FiZap,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import Link from "next/link";
import { toast } from "react-hot-toast";
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const TOAST_ID = "admin-action";

export default function AdminCarsCards({ token }) {
  const [cars, setCars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  console.log("Token in AdminCarsCards:", token);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/vehicles/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCars(res.data.data || []);
      } catch (err) {
        console.error("Error fetching vehicles:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCars();
  }, [token]);

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this car?")) {
      axios
        .delete(`${BASE_URL}/vehicles/${id}`)
        .then(() => {
          setCars((prev) => prev.filter((car) => car._id !== id));
        })
        .catch((err) => {
          console.error("Delete failed:", err);
          alert("Failed to delete vehicle");
        });
    }
  };

  const handleToggleVisible = async (id) => {
    const car = cars.find((c) => c._id === id);
    if (!car) return;

    const newVisible = !car.visible;

    setCars((prev) =>
      prev.map((c) => (c._id === id ? { ...c, visible: newVisible } : c))
    );

    try {
      await axios.put(`${BASE_URL}/vehicles/visible/${id}`, {
        visible: newVisible,
      });
      toast.success(`Car is now ${newVisible ? "visible" : "hidden"} 🎉`, {
        id: TOAST_ID,
      });
    } catch (err) {
      toast.error("Failed to update visibility ❌", { id: TOAST_ID });

      setCars((prev) =>
        prev.map((c) => (c._id === id ? { ...c, visible: car.visible } : c))
      );
    }
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {cars.map((car) => (
        <div
          key={car._id}
          className={`bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 group relative ${
            !car.visible ? "opacity-50 grayscale pointer-events-none" : ""
          }`}
        >
          <Link
            href={`/admin/cars/${car._id}`}
            className="block cursor-pointer"
          >
            <div className="relative">
              <img
                src={car.imageUrl || "/placeholder.jpg"}
                alt={car.name}
                className="w-full h-48 object-cover"
              />
              <div
                className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                  car.used
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {car.used ? "Used Car" : "Brand New"}
              </div>
            </div>
          </Link>
          <div className="p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{car.name}</h2>
                <p className="text-sm text-gray-500">
                  {car.brand} • {car.transmissionType}
                </p>
              </div>
              <span className="text-lg font-semibold text-blue-600">
                R {car.price}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <FiZap className="text-blue-500" />
                <span>{car.fuelType}</span>
              </div>
              <div className="flex items-center gap-2">
                <FiMapPin className="text-green-500" />
                <span>{car.mileage} km</span>
              </div>
              <div className="flex items-center gap-2">
                <FiDroplet className="text-pink-500" />
                <span>{car.vehicleDetails?.colour || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2">
                <FiCalendar className="text-gray-500" />
                <span>{new Date(car.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                className={`pointer-events-auto text-gray-600 hover:text-gray-800 cursor-pointer${
                  !car.visible ? " opacity-50" : ""
                }`}
                title={car.visible ? "Visible" : "Hidden"}
                onClick={() => handleToggleVisible(car._id)}
              >
                {car.visible ? <FiEye /> : <FiEyeOff />}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
