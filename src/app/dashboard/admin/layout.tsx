"use client";
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface User {
  id: string;
  name?: string;
  email: string;
  role: string;
}

async function fetchUserRole(userId: string) {
  const res = await fetch('/api/users');
  const users = await res.json();
  const user = users.find((u: User) => u.id === userId);
  return user?.role || null;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      fetchUserRole((session.user as User).id).then(fetchedRole => {
        setRole(prev => (prev !== fetchedRole ? fetchedRole : prev));
      });
    }
  }, [status, session]);

  useEffect(() => {
    if (status === "loading") return;
    if (status !== "authenticated") {
      router.replace('/');
      return;
    }
    if (role && role !== 'ADMIN') {
      router.replace('/dashboard/user');
    }
  }, [status, role, router]);

  if (status === "loading" || !role) {
    return <div className="flex items-center justify-center h-96">Loading...</div>;
  }

  return (
    <div>
      <nav className="flex gap-4 p-4 border-b">
        <Link href="/dashboard/admin/users">Users</Link>
        <Link href="/dashboard/admin/greenhouses">Greenhouses</Link>
        <Link href="/dashboard/admin/schedules">Schedules</Link>
        <Link href="/dashboard/admin/inventory">Inventory</Link>
        <Link href="/dashboard/admin/reports">Reports</Link>
      </nav>
      <main>{children}</main>
    </div>
  );
} 