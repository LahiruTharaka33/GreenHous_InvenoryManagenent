"use client";
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

async function fetchUserRole(userId: string) {
  const res = await fetch('/api/users');
  const users = await res.json();
  const user = users.find((u: any) => u.id === userId);
  return user?.role || null;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      fetchUserRole((session.user as any).id).then(fetchedRole => {
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
        <a href="/dashboard/admin/users">Users</a>
        <a href="/dashboard/admin/greenhouses">Greenhouses</a>
        <a href="/dashboard/admin/schedules">Schedules</a>
        <a href="/dashboard/admin/inventory">Inventory</a>
        <a href="/dashboard/admin/reports">Reports</a>
      </nav>
      <main>{children}</main>
    </div>
  );
} 