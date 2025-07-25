"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from 'react';
import SkeletonTable from "@/app/components/SkeletonTable";
import { PlusIcon } from "@heroicons/react/24/solid";

interface Schedule {
  id: string;
  description: string;
  startDate: string;
  endDate?: string;
  items: string;
  greenhouseId: string;
}
interface NewSchedule {
  description: string;
  startDate: string;
  endDate?: string;
  items: string;
  greenhouseId: string;
}

interface Greenhouse {
  id: string;
  name: string;
}

interface User {
  id: string;
  role: string;
}

type ScheduleFormProps =
  | { onSave: (data: NewSchedule) => void; initial?: undefined; greenhouses: Greenhouse[]; onCancel: () => void }
  | { onSave: (data: Partial<Schedule>) => void; initial: Schedule; greenhouses: Greenhouse[]; onCancel: () => void };

function ScheduleForm({ onSave, onCancel, initial, greenhouses }: ScheduleFormProps) {
  const [description, setDescription] = useState(initial?.description || "");
  const [startDate, setStartDate] = useState(initial?.startDate ? initial.startDate.slice(0, 10) : "");
  const [endDate, setEndDate] = useState(initial?.endDate ? initial.endDate.slice(0, 10) : "");
  const [items, setItems] = useState(initial?.items || "");
  const [greenhouseId, setGreenhouseId] = useState(initial?.greenhouseId || (greenhouses[0]?.id || ""));
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSave({ description, startDate, endDate: endDate || undefined, items, greenhouseId });
      }}
      className="flex flex-col gap-4 p-4 border rounded-xl bg-white shadow max-w-md"
    >
      <label className="font-semibold mb-1">Greenhouse
        <select className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-green-200 focus:border-green-500 transition" value={greenhouseId} onChange={e => setGreenhouseId(e.target.value)} required>
          {greenhouses.map(g => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
      </label>
      <label className="font-semibold mb-1">Description
        <input className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-green-200 focus:border-green-500 transition" value={description} onChange={e => setDescription(e.target.value)} required />
      </label>
      <label className="font-semibold mb-1">Start Date
        <input className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-green-200 focus:border-green-500 transition" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
      </label>
      <label className="font-semibold mb-1">End Date
        <input className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-green-200 focus:border-green-500 transition" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
      </label>
      <label className="font-semibold mb-1">Items (CSV or JSON)
        <textarea className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-green-200 focus:border-green-500 transition" value={items} onChange={e => setItems(e.target.value)} />
      </label>
      <div className="flex gap-2 mt-2">
        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition">Save</button>
        <button type="button" className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg font-semibold transition" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

export default function AdminSchedulesPage() {
  const { data: session, status } = useSession();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [greenhouses, setGreenhouses] = useState<Greenhouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editSchedule, setEditSchedule] = useState<Schedule | null>(null);
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

  const fetchSchedules = () => {
    setLoading(true);
    fetch('/api/schedules')
      .then(res => res.json())
      .then(setSchedules)
      .catch(() => setError("Failed to load schedules"))
      .finally(() => setLoading(false));
  };

  const fetchGreenhouses = () => {
    fetch('/api/greenhouses')
      .then(res => res.json())
      .then(setGreenhouses);
  };

  useEffect(() => {
    fetchSchedules();
    fetchGreenhouses();
  }, []);

  const handleCreate = async (data: NewSchedule) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const newSchedule = await res.json();
      setSchedules(prev => [...prev, newSchedule]);
      setShowForm(false);
    } catch {
      setError("Failed to create schedule");
    }
    setLoading(false);
  };

  const handleEdit = async (data: Schedule) => {
    setLoading(true);
    setError(null);
    try {
      await fetch('/api/schedules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editSchedule, ...data }),
      });
      setEditSchedule(null);
      fetchSchedules();
    } catch {
      setError("Failed to update schedule");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this schedule?")) return;
    setLoading(true);
    setError(null);
    try {
      await fetch('/api/schedules', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      fetchSchedules();
    } catch {
      setError("Failed to delete schedule");
    }
    setLoading(false);
  };

  if (loading && !showForm && !editSchedule) {
    return (
      <div className="p-8">
        <SkeletonTable rows={5} columns={role === 'ADMIN' ? 6 : 5} />
      </div>
    );
  }
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Fertilizer Schedules</h1>
        {role === 'ADMIN' && (
          <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold shadow transition text-base" onClick={() => setShowForm(true)}>
            <PlusIcon className="h-5 w-5" />
            Add New Schedule
          </button>
        )}
      </div>
      {showForm && (
        <ScheduleForm greenhouses={greenhouses} onSave={handleCreate} onCancel={() => setShowForm(false)} />
      )}
      {editSchedule && (
        <ScheduleForm greenhouses={greenhouses} initial={editSchedule} onSave={data => handleEdit({ ...editSchedule, ...data })} onCancel={() => setEditSchedule(null)} />
      )}
      <table className="table-modern w-full border mt-4 bg-white">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Greenhouse</th>
            <th className="p-2 border">Description</th>
            <th className="p-2 border">Start Date</th>
            <th className="p-2 border">End Date</th>
            <th className="p-2 border">Items</th>
            {role === 'ADMIN' && <th className="p-2 border">Actions</th>}
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
              {role === 'ADMIN' && (
                <td className="p-2 border flex gap-2">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg font-semibold transition" onClick={() => setEditSchedule(s)}>
                    Edit
                  </button>
                  <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg font-semibold transition" onClick={() => handleDelete(s.id)}>
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 