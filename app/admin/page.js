import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminCarsTable from '@/components/admin/CarsTable';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';


export default async function AdminCarsPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken');

  if (!token) {
    redirect('/auth/login');
  }



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

      <AdminCarsTable token={token.value} />
    </div>
  );
}