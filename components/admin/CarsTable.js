'use client';
import { useState } from 'react';
import { FiEdit, FiTrash } from 'react-icons/fi';

// Initial mock data
const initialCars = [
  {
    _id: '1',
    title: 'Toyota Corolla',
    price: 250000,
    year: 2022,
    make: 'Toyota',
    model: 'Corolla',
    mileage: 15000,
    images: ['/car-placeholder.jpg'],
    features: ['Bluetooth', 'Backup Camera']
  },
  {
    _id: '2',
    title: 'VW Golf GTI',
    price: 350000,
    year: 2021,
    make: 'Volkswagen',
    model: 'Golf GTI',
    mileage: 25000,
    images: ['/car-placeholder.jpg'],
    features: ['Turbocharged', 'Heated Seats']
  },
];

export default function AdminCarsTable() {
  const [cars, setCars] = useState(initialCars);
  const [currentCars, setCurrentCars] = useState(initialCars);

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this car?')) {
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
                <button
                  className="text-blue-600 hover:text-blue-900"
                  onClick={() => console.log('Edit:', car._id)} // Add edit logic
                >
                  <FiEdit className="inline-block" />
                </button>
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