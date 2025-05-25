'use client';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { FiEdit, FiTrash, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminCarsCards() {
    const [cars, setCars] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedCard, setExpandedCard] = useState(null); // track expanded card

    useEffect(() => {
        axios
            .get(`${BASE_URL}/vehicles/all`)
            .then(res => {
                console.log('API response:', res);
                setCars(res.data.data || []);
            })
            .catch(err => {
                console.error('Error fetching vehicles:', err);
            })
            .finally(() => setIsLoading(false));
    }, []);

    const handleDelete = id => {
        if (confirm('Are you sure you want to delete this car?')) {
            setCars(cars.filter(car => car._id !== id));
        }
    };

    const toggleExpand = id => {
        setExpandedCard(prev => (prev === id ? null : id));
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.map(car => (
                <div
                    key={car._id}
                    className="bg-white rounded-2xl shadow-md overflow-hidden border hover:shadow-lg transition-all duration-300"
                >
                    <div className="w-full h-48 bg-gray-200 overflow-hidden">
                        <img
                            src={car.imageUrl || ''}
                            alt={car.name}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <div className="p-4 space-y-2">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">{car.name}</h2>
                                <p className="text-sm text-gray-500">{car.brand} • {car.transmissionType}</p>
                            </div>
                            <span
                                className={`${
                                    car.used
                                        ? 'bg-orange-100 text-orange-800'
                                        : 'bg-green-100 text-green-800'
                                } text-xs font-medium px-2 py-1 rounded-full`}
                            >
  {car.used ? 'Used' : 'New'}
</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                            <div><span className="font-medium">Price:</span> R {car.price}</div>
                            <div><span className="font-medium">Fuel:</span> {car.fuelType}</div>
                            <div><span className="font-medium">Mileage:</span> {car.mileage}</div>
                            <div><span className="font-medium">Colour:</span> {car.vehicleDetails?.colour}</div>
                        </div>

                        <button
                            onClick={() => toggleExpand(car._id)}
                            className="flex items-center text-sm text-blue-600 mt-2 hover:underline"
                        >
                            {expandedCard === car._id ? (
                                <>
                                    <FiChevronUp className="mr-1" /> Show Less
                                </>
                            ) : (
                                <>
                                    <FiChevronDown className="mr-1" /> Show More
                                </>
                            )}
                        </button>

                        {expandedCard === car._id && (
                            <div className="mt-2 text-sm text-gray-700 space-y-1 border-t pt-2">
                                <div><span className="font-medium">Body Type:</span> {car.vehicleDetails?.bodyType}</div>
                                <div><span className="font-medium">Previous Owners:</span> {car.vehicleDetails?.previousOwners}</div>
                                <div><span className="font-medium">Service History:</span> {car.vehicleDetails?.serviceHistory}</div>
                                <div><span className="font-medium">Warranty:</span> {car.vehicleDetails?.warranty}</div>
                                <div><span className="font-medium">Extras:</span> {car.extras.length ? car.extras.join(', ') : 'None'}</div>
                                <div><span className="font-medium">Seller Comments:</span> {car.sellerComments}</div>
                                <div><span className="font-medium">Created At:</span> {new Date(car.createdAt).toLocaleDateString()}</div>
                            </div>
                        )}

                        <div className="flex justify-end space-x-4 pt-4 border-t mt-4">
                            <button
                                className="text-blue-600 hover:text-blue-800"
                                onClick={() => console.log('Edit:', car._id)}
                            >
                                <FiEdit size={18} />
                            </button>
                            <button
                                className="text-red-600 hover:text-red-800"
                                onClick={() => handleDelete(car._id)}
                            >
                                <FiTrash size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
