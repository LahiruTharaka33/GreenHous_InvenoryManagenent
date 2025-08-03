"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from 'react';
import SkeletonTable from "@/app/components/SkeletonTable";
import MobileTable from "@/app/components/MobileTable";
import MobileButton from "@/app/components/MobileButton";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/solid";

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
      <label className="font-semibold mb-1 text-gray-900">Greenhouse
        <select className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-green-200 focus:border-green-500 transition text-gray-900" value={greenhouseId} onChange={e => setGreenhouseId(e.target.value)} required>
          {greenhouses.map(g => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
      </label>
      <label className="font-semibold mb-1 text-gray-900">Description
        <input className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-green-200 focus:border-green-500 transition text-gray-900" value={description} onChange={e => setDescription(e.target.value)} required />
      </label>
      <label className="font-semibold mb-1 text-gray-900">Start Date
        <input className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-green-200 focus:border-green-500 transition text-gray-900" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
      </label>
      <label className="font-semibold mb-1 text-gray-900">End Date
        <input className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-green-200 focus:border-green-500 transition text-gray-900" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
      </label>
      <label className="font-semibold mb-1 text-gray-900">Items (CSV or JSON)
        <textarea className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-green-200 focus:border-green-500 transition text-gray-900" value={items} onChange={e => setItems(e.target.value)} />
      </label>
      <div className="flex gap-2 mt-2">
        <MobileButton type="submit">Save</MobileButton>
        <MobileButton variant="secondary" onClick={onCancel}>Cancel</MobileButton>
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

  // Define columns for the schedules table
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
    { key: "items", label: "Items", mobileLabel: "Items" },
    ...(role === 'ADMIN' ? [{
      key: "actions",
      label: "Actions",
      mobileLabel: "Actions",
      render: (value: any, row: Schedule) => (
        <div className="flex gap-2">
          <MobileButton
            size="sm"
            variant="secondary"
            leftIcon={<PencilIcon className="h-4 w-4" />}
            onClick={() => setEditSchedule(row)}
          >
            Edit
          </MobileButton>
          <MobileButton
            size="sm"
            variant="danger"
            leftIcon={<TrashIcon className="h-4 w-4" />}
            onClick={() => handleDelete(row.id)}
          >
            Delete
          </MobileButton>
        </div>
      )
    }] : [])
  ];

  if (loading && !showForm && !editSchedule) {
    return (
      <div className="p-4 md:p-8">
        <SkeletonTable rows={5} columns={role === 'ADMIN' ? 6 : 5} />
      </div>
    );
  }
  if (error) return <div className="p-4 md:p-8 text-red-600">{error}</div>;

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Fertilizer Schedules</h1>
        {role === 'ADMIN' && (
          <MobileButton
            leftIcon={<PlusIcon className="h-5 w-5" />}
            onClick={() => setShowForm(true)}
          >
            Add New Schedule
          </MobileButton>
        )}
      </div>
      
      {showForm && (
        <div className="mb-6">
          <ScheduleForm greenhouses={greenhouses} onSave={handleCreate} onCancel={() => setShowForm(false)} />
        </div>
      )}
      
      {editSchedule && (
        <div className="mb-6">
          <ScheduleForm 
            greenhouses={greenhouses} 
            initial={editSchedule} 
            onSave={data => handleEdit({ ...editSchedule, ...data })} 
            onCancel={() => setEditSchedule(null)} 
          />
        </div>
      )}
      
      <MobileTable
        data={schedules}
        columns={scheduleColumns}
        searchable={true}
        sortable={true}
      />
    </div>
  );
} 