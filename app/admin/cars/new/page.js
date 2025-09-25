'use client';
import { CarForm } from '@/app/components';
import { useRouter } from 'next/navigation';

export default function NewCarPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/admin/cars');
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/*<h1 className="text-2xl font-bold mb-6">Add New Vehicle</h1>*/}
      <CarForm onSuccess={handleSuccess} />
    </div>
  );
}