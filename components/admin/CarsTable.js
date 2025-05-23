'use client';
import { useState } from 'react';
import Link from 'next/link';
import { deleteCar } from '@/actions/carActions';
import { FiEdit, FiTrash } from 'react-icons/fi';

export default function AdminCarsTable({ cars }) {
  const [currentCars, setCurrentCars] = useState(cars);

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this car?')) {
      await deleteCar(id);
      setCurrentCars(currentCars.filter(car => car._id !== id));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Model</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {currentCars.map((car) => (
            <tr key={car._id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  {car.images?.[0] && (
                    <img
                      src={car.images[0]}
                      alt={car.title}
                      className="h-12 w-16 object-cover rounded mr-4"
                    />
                  )}
                  <div>
                    <div className="font-medium text-gray-900">{car.title}</div>
                    <div className="text-sm text-gray-500">{car.make}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">R {car.price.toLocaleString()}</td>
              <td className="px-6 py-4 whitespace-nowrap">{car.year}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Active
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap space-x-4">
                <Link
                  href={`/admin/cars/${car._id}`}
                  className="text-blue-600 hover:text-blue-900"
                >
                  <FiEdit className="inline-block" />
                </Link>
                <button
                  onClick={() => handleDelete(car._id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <FiTrash className="inline-block" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}