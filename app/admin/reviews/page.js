'use client';
import { useState } from 'react';
import { ReviewsTable, Button, NewReviewModal } from '@/app/components';

export default function AdminReviewsPage() {
    const [modalOpen, setModalOpen] = useState(false);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Manage Customer Reviews</h1>
                <Button
                    onClick={() => setModalOpen(true)}
                    className="cursor-pointer"
                >
                    Add New Review
                </Button>
            </div>

            <ReviewsTable reviews={[]} />

            <NewReviewModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
        </div>
    );
}