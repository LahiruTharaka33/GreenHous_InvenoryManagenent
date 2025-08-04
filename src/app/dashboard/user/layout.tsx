"use client";
// import { useSession } from "next-auth/react";
// import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  // You can add route protection here with useSession if needed
  return (
    <div>
      <nav className="flex gap-4 p-4 border-b">
        <Link href="/dashboard/user/assignments">My Tasks</Link>
      </nav>
      <main>{children}</main>
    </div>
  );
} 