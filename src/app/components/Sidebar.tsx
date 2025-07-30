"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  HomeIcon,
  BuildingLibraryIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  UsersIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  Bars3Icon,
  XMarkIcon,
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleMobileMenu}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <XMarkIcon className="h-6 w-6 text-gray-700" />
        ) : (
          <Bars3Icon className="h-6 w-6 text-gray-700" />
        )}
      </button>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-40
        bg-white border-r min-h-screen w-64 flex flex-col justify-between py-6 px-4 shadow-lg rounded-r-3xl
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div>
          <div className="mb-8 flex items-center gap-2 px-2">
            <span className="font-bold text-xl tracking-tight text-green-700">Greenhouse</span>
          </div>
          <nav className="flex flex-col gap-2">
            {navLinks.map(link => (
              <Link
                key={link.name}
                href={link.href}
                onClick={closeMobileMenu}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors min-h-[44px] ${
                  pathname === link.href
                    ? "bg-green-100 text-green-700 font-semibold"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                <link.icon className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">{link.name}</span>
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3 px-4 mt-8">
          {/* Replace with actual user avatar */}
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-500 flex-shrink-0">
            U
          </div>
          <div className="min-w-0">
            <div className="font-medium truncate">User Name</div>
            <div className="text-xs text-gray-500">Admin</div>
          </div>
        </div>
      </aside>
    </>
  );
} 