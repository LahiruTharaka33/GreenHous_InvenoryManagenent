"use client";
// import { useSession } from "next-auth/react";
// import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  // You can add route protection here with useSession if needed
  return (
    <div>
      <nav className="flex gap-4 p-4 border-b">
        <Link href="/dashboard/user/greenhouses">My Greenhouses</Link>
        <Link href="/dashboard/user/schedules">Fertilizer Schedules</Link>
        <Link href="/dashboard/user/inventory">Inventory Usage</Link>
      </nav>
      <main>{children}</main>
    </div>
  );
} 