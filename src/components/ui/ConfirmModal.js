import React from 'react';

export default function ConfirmModal({
                                         open,
                                         title = "Are you sure?",
                                         description = "This action cannot be undone.",
                                         confirmText = "Confirm",
                                         cancelText = "Cancel",
                                         onConfirm,
                                         onCancel
                                     }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
            <div className="relative bg-white border border-gray-200 rounded-lg shadow-xl p-5 w-80">
                <h2 className="text-base font-semibold text-gray-800 mb-2">{title}</h2>
                <p className="text-sm text-gray-600 mb-4">{description}</p>
                <div className="flex justify-end space-x-2">
                    <button
                        onClick={onCancel}
                        className="px-3 py-1.5 text-sm rounded bg-gray-100 text-gray-800 hover:bg-gray-200 cursor-pointer"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-3 py-1.5 text-sm rounded bg-red-600 text-white hover:bg-red-700 cursor-pointer"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}