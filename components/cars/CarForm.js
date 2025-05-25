'use client';
import { useState } from 'react';
import axios from 'axios';

const BASEURL = process.env.NEXT_PUBLIC_API_URL

const INITIAL_STATE = {
    name: '',
    used: false,
    mileage: '',
    transmissionType: '',
    price: '',
    fuelType: '',
    year: '',
    brand: '',
    imageUrl: '',
    imageUrls: [''],
    extras: [''],
    sellerComments: '',
    vehicleDetails: {
        previousOwners: 1,
        serviceHistory: '',
        colour: '',
        bodyType: '',
        warranty: '',
    },
    imageFiles: [],
};

export default function CarForm() {
    const [formData, setFormData] = useState(INITIAL_STATE);
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name.includes('vehicleDetails.')) {
            const key = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                vehicleDetails: { ...prev.vehicleDetails, [key]: value }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleArrayChange = (name, index, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: prev[name].map((item, i) => (i === index ? value : item))
        }));
    };

    const addArrayItem = (name) => {
        setFormData(prev => ({
            ...prev,
            [name]: [...prev[name], '']
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const form = new FormData();

            // Append primitive fields
            form.append('name', formData.name);
            form.append('used', String(formData.used));
            form.append('mileage', formData.mileage);
            form.append('transmissionType', formData.transmissionType);
            form.append('price', formData.price);
            form.append('fuelType', formData.fuelType);
            form.append('year', formData.year);
            form.append('brand', formData.brand);
            form.append('imageUrl', formData.imageUrl);
            form.append('sellerComments', formData.sellerComments);

            // Append arrays
            (formData.imageUrls || []).forEach((url, idx) => {
                form.append(`imageUrls[${idx}]`, url);
            });

            form.append('extras', JSON.stringify(formData.extras));

            // Append nested object as JSON
            form.append('vehicleDetails', JSON.stringify(formData.vehicleDetails));

            // Append image files
            (formData.imageFiles || []).forEach((file) => {
                form.append('file', file);
            });

            // Optionally, append a folder name
            form.append('folder', formData.name);

            const res = await axios.post(`${BASEURL}/vehicles/new`, form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setSuccessMsg('Vehicle added successfully!');
            setFormData(INITIAL_STATE);
        } catch (err) {
            console.error('Failed to submit vehicle:', err);
        } finally {
            setLoading(false);
        }
    };


    return (
        <>
        {successMsg && (
            <div className="mb-4 p-3 rounded bg-green-100 text-green-800 text-center font-semibold border border-green-300">
                {successMsg}
            </div>
        )}

        <form className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto space-y-8"
              onSubmit={handleSubmit}
        >

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Vehicle Name" name="name" value={formData.name} onChange={handleChange} />
                <Input label="Brand" name="brand" value={formData.brand} onChange={handleChange} />
                <Input label="Price (ZAR)" name="price" type="number" value={formData.price} onChange={handleChange} />
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                    <select
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500"
                    >
                        <option value="">Select year</option>
                        {Array.from({ length: 30 }, (_, i) => {
                            const year = new Date().getFullYear() - i;
                            return (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            );
                        })}
                    </select>
                </div>

                <Input label="Mileage" name="mileage" value={formData.mileage} onChange={handleChange} />
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="fuelType"
                                value="Petrol"
                                checked={formData.fuelType === 'Petrol'}
                                onChange={handleChange}
                                className="text-blue-600"
                            />
                            Petrol
                        </label>
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="fuelType"
                                value="Diesel"
                                checked={formData.fuelType === 'Diesel'}
                                onChange={handleChange}
                                className="text-blue-600"
                            />
                            Diesel
                        </label>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Transmission</label>
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="transmissionType"
                                value="Manual"
                                checked={formData.transmissionType === 'Manual'}
                                onChange={handleChange}
                                className="text-blue-600"
                            />
                            Manual
                        </label>
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="transmissionType"
                                value="Automatic"
                                checked={formData.transmissionType === 'Automatic'}
                                onChange={handleChange}
                                className="text-blue-600"
                            />
                            Automatic
                        </label>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Used</label>
                    <input
                        type="checkbox"
                        name="used"
                        checked={formData.used}
                        onChange={handleChange}
                        className="w-5 h-5 text-blue-600 rounded border-gray-300"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Extras</label>
                    {formData.extras.map((extra, idx) => (
                        <input
                            key={idx}
                            type="text"
                            value={extra}
                            onChange={e => handleArrayChange('extras', idx, e.target.value)}
                            className="mb-2 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500"
                            placeholder={`Extra Feature ${idx + 1}`}
                        />
                    ))}
                    <button type="button" onClick={() => addArrayItem('extras')} className="text-blue-600 text-sm mt-1 hover:underline">
                        + Add Extra
                    </button>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Seller Comments</label>
                    <textarea
                        name="sellerComments"
                        value={formData.sellerComments}
                        onChange={handleChange}
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500"
                        rows={4}
                        placeholder="Describe the car, condition, highlights, etc."
                    />
                </div>

                {/* Vehicle Details */}
                <Input
                    label="Previous Owners"
                    name="vehicleDetails.previousOwners"
                    type="number"
                    value={formData.vehicleDetails.previousOwners}
                    onChange={handleChange}
                />
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service History</label>
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="vehicleDetails.serviceHistory"
                                value="Yes"
                                checked={formData.vehicleDetails.serviceHistory === 'Yes'}
                                onChange={handleChange}
                                className="text-blue-600"
                            />
                            Yes
                        </label>
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="vehicleDetails.serviceHistory"
                                value="No"
                                checked={formData.vehicleDetails.serviceHistory === 'No'}
                                onChange={handleChange}
                                className="text-blue-600"
                            />
                            No
                        </label>
                    </div>
                </div>

                <Input
                    label="Colour"
                    name="vehicleDetails.colour"
                    value={formData.vehicleDetails.colour}
                    onChange={handleChange}
                />
                <Input
                    label="Body Type"
                    name="vehicleDetails.bodyType"
                    value={formData.vehicleDetails.bodyType}
                    onChange={handleChange}
                />
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Warranty</label>
                    <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="vehicleDetails.warranty"
                                value="Has Warranty"
                                checked={formData.vehicleDetails.warranty === 'Has Warranty'}
                                onChange={handleChange}
                                className="text-blue-600"
                            />
                            Has Warranty
                        </label>
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="vehicleDetails.warranty"
                                value="No Warranty"
                                checked={formData.vehicleDetails.warranty === 'No Warranty'}
                                onChange={handleChange}
                                className="text-blue-600"
                            />
                            No Warranty
                        </label>
                    </div>
                </div>

            </div>

            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Images</label>
                <div className="flex items-center space-x-4">
                    <label
                        htmlFor="imageUpload"
                        className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
                    >
                        <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12v8m0-8l3-3m-3 3l-3-3"></path>
                        </svg>
                        Choose Images
                    </label>
                    <input
                        id="imageUpload"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            setFormData(prev => ({
                                ...prev,
                                imageFiles: [...prev.imageFiles, ...files],
                            }));
                        }}
                        className="hidden"
                    />
                    {formData.imageFiles && formData.imageFiles.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {formData.imageFiles.map((file, idx) => (
                                <img
                                    key={idx}
                                    src={URL.createObjectURL(file)}
                                    alt={`Preview ${idx + 1}`}
                                    className="w-20 h-20 object-cover rounded border"
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="pt-4">
                <button
                    type="submit"
                    className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition duration-200"
                >
                    Save Vehicle
                </button>
            </div>
        </form>
        </>
    );
}

export function Input({ label, name, value, onChange, type = "text" }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
        </div>
    );
}

