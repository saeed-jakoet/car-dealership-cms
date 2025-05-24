// app/admin/cars/page.js
'use client';
import AdminCarsTable from '@/components/admin/CarsTable';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function AdminCarsPage() {
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
      <AdminCarsTable />
    </div>
  );
}