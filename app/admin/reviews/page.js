'use client';
import { useState } from 'react';
import AdminReviews from '@/components/admin/reviewsTable';
import { Button } from '@/components/ui/Button';
import newReviewModal from '@/components/NewReviewModal';

export default function AdminReviewsPage() {
    const [modalOpen, setModalOpen] = useState(false);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Manage Customer Reviews</h1>
                <Button onClick={() => setModalOpen(true)}>Add New Review</Button>
            </div>

            <AdminReviews reviews={[]} />

            <newReviewModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
        </div>
    );
}