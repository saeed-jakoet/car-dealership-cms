'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthPost } from '../../../lib';
import CarForm from '../../../components/features/vehicles/CarForm';

export default function NewCarPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const authPost = useAuthPost();

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const response = await authPost("/vehicles/new", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      router.push('/admin/cars');
    } catch (error) {
      console.error("Failed to create vehicle:", error);
      throw error; // Let CarForm handle the error display
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/cars');
  };

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-8 my-10">
      <CarForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitButtonText="Create Vehicle"
        showCancelButton={true}
        onCancel={handleCancel}
        showImageUpload={true}
        isEditMode={false}
      />
    </div>
  );
}