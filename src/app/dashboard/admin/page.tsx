"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import MobileButton from "@/app/components/MobileButton";
import MobileTable, { MobileTableHeader, MobileTableBody, MobileTableRow, MobileTableCell } from "@/app/components/MobileTable";
import { 
  BuildingLibraryIcon, 
  ClipboardDocumentListIcon, 
  CalendarDaysIcon, 
  UsersIcon,
  ChartBarIcon 
} from "@heroicons/react/24/outline";

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (status !== "authenticated") {
      router.replace("/auth/signin");
    }
  }, [status, router]);

  if (status !== "authenticated") {
    return <div>Loading...</div>;
  }

  const dashboardStats = [
    { name: "Greenhouses", value: "12", icon: BuildingLibraryIcon, color: "bg-green-500" },
    { name: "Inventory Items", value: "156", icon: ClipboardDocumentListIcon, color: "bg-blue-500" },
    { name: "Active Schedules", value: "8", icon: CalendarDaysIcon, color: "bg-purple-500" },
    { name: "Users", value: "24", icon: UsersIcon, color: "bg-orange-500" },
  ];

  const recentActivities = [
    { id: 1, action: "Temperature Alert", greenhouse: "GH-001", time: "2 min ago", status: "warning" },
    { id: 2, action: "Inventory Updated", greenhouse: "GH-003", time: "15 min ago", status: "success" },
    { id: 3, action: "New Schedule Created", greenhouse: "GH-002", time: "1 hour ago", status: "info" },
    { id: 4, action: "User Login", greenhouse: "Admin", time: "2 hours ago", status: "info" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Welcome back, {session.user?.name || session.user?.email}!
          </h1>
          <p className="text-gray-600 mt-1">Here's what's happening with your greenhouses today.</p>
        </div>
        <div className="mt-4 md:mt-0">
          <MobileButton size="lg">
            <ChartBarIcon className="h-5 w-5 mr-2" />
            View Reports
          </MobileButton>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardStats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
        </div>
        <div className="p-6">
          <MobileTable>
            <MobileTableHeader>
              <MobileTableRow>
                <MobileTableCell isHeader>Action</MobileTableCell>
                <MobileTableCell isHeader>Greenhouse</MobileTableCell>
                <MobileTableCell isHeader>Time</MobileTableCell>
                <MobileTableCell isHeader>Status</MobileTableCell>
              </MobileTableRow>
            </MobileTableHeader>
            <MobileTableBody>
              {recentActivities.map((activity) => (
                <MobileTableRow key={activity.id}>
                  <MobileTableCell>{activity.action}</MobileTableCell>
                  <MobileTableCell>{activity.greenhouse}</MobileTableCell>
                  <MobileTableCell>{activity.time}</MobileTableCell>
                  <MobileTableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      activity.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      activity.status === 'success' ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {activity.status}
                    </span>
                  </MobileTableCell>
                </MobileTableRow>
              ))}
            </MobileTableBody>
          </MobileTable>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MobileButton variant="secondary" fullWidth>
          <BuildingLibraryIcon className="h-5 w-5 mr-2" />
          Manage Greenhouses
        </MobileButton>
        <MobileButton variant="secondary" fullWidth>
          <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />
          View Inventory
        </MobileButton>
        <MobileButton variant="secondary" fullWidth>
          <CalendarDaysIcon className="h-5 w-5 mr-2" />
          Check Schedules
        </MobileButton>
      </div>
    </div>
  );
} 