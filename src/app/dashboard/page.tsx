"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface User {
  id: string;
  name?: string;
  email: string;
  role: string;
}

async function fetchUserRole(email: string) {
  const res = await fetch('/api/users');
  const users = await res.json();
  const user = users.find((u: User) => u.email === email);
  return user?.role || null;
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email) {
      fetchUserRole(session.user.email).then(setRole);
    }
  }, [status, session]);

  useEffect(() => {
    if (status === 'loading') return;
    if (status !== 'authenticated') {
      router.replace('/');
      return;
    }
    if (role === 'ADMIN') {
      router.replace('/dashboard/admin');
    } else if (role === 'USER') {
      router.replace('/dashboard/user');
    }
  }, [status, role, router]);

  return <div className="flex items-center justify-center h-96">Loading dashboard...</div>;
} 