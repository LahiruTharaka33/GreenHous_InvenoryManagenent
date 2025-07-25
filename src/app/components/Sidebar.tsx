"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  BuildingLibraryIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  UsersIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";

const navLinks = [
  { name: "Dashboard", href: "/dashboard/admin", icon: HomeIcon },
  { name: "Greenhouses", href: "/dashboard/admin/greenhouses", icon: BuildingLibraryIcon },
  { name: "Inventory", href: "/dashboard/admin/inventory", icon: ClipboardDocumentListIcon },
  { name: "Schedules", href: "/dashboard/admin/schedules", icon: CalendarDaysIcon },
  { name: "Users", href: "/dashboard/admin/users", icon: UsersIcon },
  { name: "Reports", href: "/dashboard/admin/reports", icon: ChartBarIcon },
  { name: "Settings", href: "/dashboard/admin/settings", icon: Cog6ToothIcon },
  { name: "Help", href: "/dashboard/admin/help", icon: QuestionMarkCircleIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="bg-white border-r min-h-screen w-64 flex flex-col justify-between py-6 px-4 shadow-lg rounded-r-3xl">
      <div>
        <div className="mb-8 flex items-center gap-2 px-2">
          <span className="font-bold text-xl tracking-tight text-green-700">Greenhouse</span>
        </div>
        <nav className="flex flex-col gap-2">
          {navLinks.map(link => (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                pathname === link.href
                  ? "bg-green-100 text-green-700 font-semibold"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <link.icon className="h-5 w-5" />
              {link.name}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-3 px-4 mt-8">
        {/* Replace with actual user avatar */}
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-500">
          U
        </div>
        <div>
          <div className="font-medium">User Name</div>
          <div className="text-xs text-gray-500">Admin</div>
        </div>
      </div>
    </aside>
  );
} 