'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Tab } from '@headlessui/react';
import { ExclamationIcon } from '../../components';
import Cookies from 'js-cookie';
import { CheckIcon } from '@heroicons/react/24/solid';

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch user info from API using accessToken from cookies
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = Cookies.get("accessToken"); // <-- Get from cookies
        if (!token) throw new Error("No access token found");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include', 
        });
        if (!res.ok) throw new Error("Failed to fetch user data");
        const data = await res.json();
        setUser(data);
      } catch (err) {
        setErrorMessage(err.message);
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>
        
        <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
          <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 mb-6">
            {['Profile', 'Security', 'Preferences'].map((tab, idx) => (
              <Tab
                key={idx}
                className={({ selected }) =>
                  `w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700
                   ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2
                   ${selected ? 'bg-white shadow' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'}`
                }
              >
                {tab}
              </Tab>
            ))}
          </Tab.List>

          <Tab.Panels className="mt-2">
            <Tab.Panel>
              <ProfileSettings 
                user={user}
                setSuccess={setSuccessMessage}
                setError={setErrorMessage}
              />
            </Tab.Panel>
            <Tab.Panel>
              <SecuritySettings 
                setSuccess={setSuccessMessage}
                setError={setErrorMessage}
              />
            </Tab.Panel>
            <Tab.Panel>
              <AppSettings 
                setSuccess={setSuccessMessage}
                setError={setErrorMessage}
              />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>

        {/* Notifications */}
        {successMessage && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg flex items-center gap-2">
            <CheckIcon className="w-5 h-5" />
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg flex items-center gap-2">
            <ExclamationIcon className="w-5 h-5" />
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
}

// Profile Settings Component
function ProfileSettings({ user, setSuccess, setError }) {
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState({ name: '', email: '' });
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: initialData
  });

  // Fetch user data from API with accessToken
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) throw new Error("No access token found");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to fetch user data");
        const data = await res.json();
        setInitialData({ name: data.name, email: data.email });
        reset({ name: data.name, email: data.email });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [reset, setError]);

  const onSubmit = async (data) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("No access token found");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error('Update failed');
      
      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 5000);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            {...register('name', { required: 'Name is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            {...register('email', { required: 'Email is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>

        <button
          type="submit"
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Update Profile
        </button>
      </div>
    </form>
  );
}

// Security Settings Component
function SecuritySettings({ setSuccess, setError }) {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword
        })
      });

      if (!response.ok) throw new Error('Password update failed');
      
      setSuccess('Password updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 5000);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Current Password</label>
          <input
            type="password"
            {...register('currentPassword', { required: 'Current password is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.currentPassword && <p className="text-red-500 text-sm mt-1">{errors.currentPassword.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">New Password</label>
          <input
            type="password"
            {...register('newPassword', { 
              required: 'New password is required',
              minLength: { value: 8, message: 'Password must be at least 8 characters' }
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
          <input
            type="password"
            {...register('confirmPassword', { required: 'Please confirm your password' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
        </div>

        <button
          type="submit"
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Change Password
        </button>
      </div>
    </form>
  );
}

// App Settings Component
function AppSettings({ setSuccess, setError }) {
  // Add dealership-specific settings here
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <p className="text-gray-500">Dealership settings coming soon</p>
    </div>
  );
}