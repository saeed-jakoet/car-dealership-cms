'use client';
import { useFormState } from 'react-dom';
import { createCar, updateCar } from '@/actions/carActions';

export default function CarForm({ car }) {
  const [state, formAction] = useFormState(car ? updateCar.bind(null, car._id) : createCar, {});

  return (
    <form action={formAction} className="space-y-6 bg-white p-6 rounded-lg shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input name="title" defaultValue={car?.title} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        {/* Add more fields similarly */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Price (ZAR)</label>
          <input type="number" name="price" defaultValue={car?.price} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        {/* Add fields for mileage, year, make, model, etc */}
      </div>
      <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
        {car ? 'Update Car' : 'Add New Car'}
      </button>
    </form>
  );
}