'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import AdminCarsTable from '@/components/admin/CarsTable';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminCarsPage() {
  const [cars, setCars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/vehicles/all`);
        setCars(response.data.data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching vehicles:', err);
        setError('Failed to load vehicles');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCars();
  }, []);

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this car?')) {
      try {
        await axios.delete(`${BASE_URL}/vehicles/${id}`);
        setCars(prev => prev.filter(car => car._id !== id));
      } catch (err) {
        console.error('Delete failed:', err);
        alert('Failed to delete vehicle');
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Vehicle Listings</h1>
        <Link href="/admin/cars/new">
          <Button>
            Add New Vehicle
          </Button>
        </Link>
      </div>
      
      {isLoading && <div className="text-center py-4">Loading vehicles...</div>}
      {error && <div className="text-red-500 py-4">{error}</div>}
      {!isLoading && !error && (
        <AdminCarsTable 
          cars={cars}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}