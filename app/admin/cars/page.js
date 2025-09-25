'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CarsTable, Button } from '@/app/components';
import { useToken } from '@/app/hooks';
import Link from 'next/link';

export default function AdminCarsPage() {
  const router = useRouter();
  const token = useToken();

  useEffect(() => {
    if (!token) {
      router.push('/auth/login');
    }
  }, [token, router]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Vehicle Listings</h1>
        <Link href="/admin/cars/new">
          <Button className="cursor-pointer">
            Add New Vehicle
          </Button>
        </Link>
      </div>

      <CarsTable />
    </div>
  );
}
