'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AuthGuard({ children }) {
  const { status } = useSession();
  const router = useRouter();

  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'unauthenticated') {
    router.push('/auth/login');
    return null;
  }

  return children;
}