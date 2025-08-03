"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  HomeIcon,
  BuildingLibraryIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  UserIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";

interface User {
  id: string;
  name?: string;
  email: string;
  role: string;
}

const adminNavLinks = [
  { name: "Dashboard", href: "/dashboard/admin", icon: HomeIcon },
  { name: "Greenhouses", href: "/dashboard/admin/greenhouses", icon: BuildingLibraryIcon },
  { name: "Inventory", href: "/dashboard/admin/inventory", icon: ClipboardDocumentListIcon },
  { name: "Schedules", href: "/dashboard/admin/schedules", icon: CalendarDaysIcon },
  { name: "Assignments", href: "/dashboard/admin/assignments", icon: ClipboardDocumentIcon },
  { name: "Profile", href: "/profile", icon: UserIcon },
];

const userNavLinks = [
  { name: "Dashboard", href: "/dashboard/user", icon: HomeIcon },
  { name: "Greenhouses", href: "/dashboard/user/greenhouses", icon: BuildingLibraryIcon },
  { name: "Inventory", href: "/dashboard/user/inventory", icon: ClipboardDocumentListIcon },
  { name: "Schedules", href: "/dashboard/user/schedules", icon: CalendarDaysIcon },
  { name: "Assignments", href: "/dashboard/user/assignments", icon: ClipboardDocumentIcon },
  { name: "Profile", href: "/profile", icon: UserIcon },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      fetch('/api/users')
        .then(res => res.json())
        .then(users => {
          const u = users.find((u: User) => u.id === (session.user as User).id);
          setRole(u?.role || null);
        });
    }
  }, [status, session]);

  // Don't show navigation on the landing page
  if (pathname === '/') {
    return null;
  }

  const mobileNavLinks = role === 'ADMIN' ? adminNavLinks : userNavLinks;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg">
      <div className="flex justify-around items-center h-16 px-2">
        {mobileNavLinks.map(link => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex flex-col items-center justify-center flex-1 min-h-[44px] min-w-[44px] px-2 py-1 transition-colors rounded-lg ${
                isActive
                  ? "text-green-600 bg-green-50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <link.icon className="h-6 w-6 mb-1" />
              <span className="text-xs font-medium text-center leading-tight">{link.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
} 