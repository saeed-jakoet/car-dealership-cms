import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { CarsTable, Button } from '@/app/components';
import Link from 'next/link';


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
            <Button className="cursor-pointer">
                Add New Vehicle
            </Button>
        </Link>
      </div>

      <CarsTable token={token.value} />
    </div>
  );
}