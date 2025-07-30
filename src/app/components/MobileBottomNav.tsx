"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  BuildingLibraryIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

const mobileNavLinks = [
  { name: "Dashboard", href: "/dashboard/admin", icon: HomeIcon },
  { name: "Greenhouses", href: "/dashboard/admin/greenhouses", icon: BuildingLibraryIcon },
  { name: "Inventory", href: "/dashboard/admin/inventory", icon: ClipboardDocumentListIcon },
  { name: "Schedules", href: "/dashboard/admin/schedules", icon: CalendarDaysIcon },
  { name: "Profile", href: "/profile", icon: UserIcon },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center h-16">
        {mobileNavLinks.map(link => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex flex-col items-center justify-center flex-1 min-h-[44px] transition-colors ${
                isActive
                  ? "text-green-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <link.icon className="h-6 w-6 mb-1" />
              <span className="text-xs font-medium">{link.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
} 