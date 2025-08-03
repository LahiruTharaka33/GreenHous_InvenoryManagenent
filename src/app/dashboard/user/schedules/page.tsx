"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from 'react';
import MobileTable from "@/app/components/MobileTable";

interface Schedule {
  id: string;
  description: string;
  startDate: string;
  endDate?: string;
  items: string;
  greenhouseId: string;
}
interface Greenhouse {
  id: string;
  name: string;
  location?: string;
}
interface Assignment {
  id: string;
  userId: string;
  greenhouseId: string;
  assignedAt?: string;
}

export default function UserSchedulesPage() {
  const { data: session, status } = useSession();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [greenhouses, setGreenhouses] = useState<Greenhouse[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      Promise.all([
        fetch('/api/assignments').then(res => res.json()),
        fetch('/api/greenhouses').then(res => res.json()),
        fetch('/api/schedules').then(res => res.json()),
      ])
        .then(([assignments, greenhouses, schedules]) => {
          setAssignments(assignments);
          setGreenhouses(greenhouses);
          // Find assigned greenhouse IDs for this user
          const assignedIds = assignments.filter((a: Assignment) => a.userId === session.user.id).map((a: Assignment) => a.greenhouseId);
          // Only show schedules for assigned greenhouses
          setSchedules(schedules.filter((s: Schedule) => assignedIds.includes(s.greenhouseId)));
        })
        .catch(() => setError("Failed to load schedules"))
        .finally(() => setLoading(false));
    }
  }, [status, session]);

  // Define columns for the user schedules table
  const scheduleColumns = [
    { 
      key: "greenhouseId", 
      label: "Greenhouse", 
      mobileLabel: "GH",
      render: (value: string) => greenhouses.find(g => g.id === value)?.name || value
    },
    { key: "description", label: "Description", mobileLabel: "Desc" },
    { 
      key: "startDate", 
      label: "Start Date", 
      mobileLabel: "Start",
      render: (value: string) => value?.slice(0, 10) || ''
    },
    { 
      key: "endDate", 
      label: "End Date", 
      mobileLabel: "End",
      render: (value: string) => value?.slice(0, 10) || 'N/A'
    },
    { key: "items", label: "Items", mobileLabel: "Items" }
  ];

  if (status === "loading" || loading) return <div className="p-4 md:p-8">Loading...</div>;
  if (error) return <div className="p-4 md:p-8 text-red-600">{error}</div>;
  if (schedules.length === 0) return <div className="p-4 md:p-8">No schedules for your assigned greenhouses.</div>;

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Fertilizer Schedules</h1>
      <MobileTable
        data={schedules}
        columns={scheduleColumns}
        searchable={true}
        sortable={true}
      />
    </div>
  );
} 