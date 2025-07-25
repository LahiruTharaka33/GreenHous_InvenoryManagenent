"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from 'react';

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

  if (status === "loading" || loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (schedules.length === 0) return <div className="p-8">No schedules for your assigned greenhouses.</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Fertilizer Schedules</h1>
      <table className="w-full border mt-4 bg-white">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Greenhouse</th>
            <th className="p-2 border">Description</th>
            <th className="p-2 border">Start Date</th>
            <th className="p-2 border">End Date</th>
            <th className="p-2 border">Items</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map(s => (
            <tr key={s.id}>
              <td className="p-2 border">{greenhouses.find(g => g.id === s.greenhouseId)?.name || s.greenhouseId}</td>
              <td className="p-2 border">{s.description}</td>
              <td className="p-2 border">{s.startDate?.slice(0, 10)}</td>
              <td className="p-2 border">{s.endDate?.slice(0, 10)}</td>
              <td className="p-2 border">{s.items}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 