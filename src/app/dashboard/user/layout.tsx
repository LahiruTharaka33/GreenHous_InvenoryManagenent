"use client";
// import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
// import { useEffect, useState } from 'react';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  // You can add route protection here with useSession if needed
  return (
    <div>
      <nav className="flex gap-4 p-4 border-b">
        <a href="/dashboard/user/greenhouses">My Greenhouses</a>
        <a href="/dashboard/user/schedules">Fertilizer Schedules</a>
        <a href="/dashboard/user/inventory">Inventory Usage</a>
      </nav>
      <main>{children}</main>
    </div>
  );
} 