"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from 'react';
import { z } from 'zod';
import SkeletonTable from "@/app/components/SkeletonTable";
import { PlusIcon } from "@heroicons/react/24/solid";

interface Greenhouse {
  id: string;
  name: string;
  location?: string;
}
interface NewGreenhouse {
  name: string;
  location?: string;
}

const greenhouseSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  location: z.string().optional(),
});

type GreenhouseFormProps =
  | { onSave: (data: NewGreenhouse) => void; initial?: undefined; onCancel: () => void }
  | { onSave: (data: Partial<Greenhouse>) => void; initial: Greenhouse; onCancel: () => void };

function GreenhouseForm({ onSave, onCancel, initial }: GreenhouseFormProps) {
  const [name, setName] = useState(initial?.name || "");
  const [location, setLocation] = useState(initial?.location || "");
  const [errors, setErrors] = useState<{ name?: string; location?: string }>({});
  const [touched, setTouched] = useState<{ name?: boolean; location?: boolean }>({});

  const validate = () => {
    const result = greenhouseSchema.safeParse({ name, location });
    if (!result.success) {
      const fieldErrors: any = {};
      for (const err of result.error.issues) {
        fieldErrors[err.path[0]] = err.message;
      }
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  useEffect(() => {
    if (Object.keys(touched).length > 0) validate();
    // eslint-disable-next-line
  }, [name, location]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, location: true });
    if (validate()) {
      onSave({ name, location });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 border rounded-xl bg-white shadow max-w-md">
      <label className="font-semibold mb-1">Name
        <input
          className={`border rounded-lg p-2 w-full focus:ring-2 focus:ring-green-200 focus:border-green-500 transition ${errors.name ? 'border-red-500' : ''}`}
          value={name}
          onChange={e => setName(e.target.value)}
          onBlur={() => setTouched(t => ({ ...t, name: true }))}
          required
        />
        {touched.name && errors.name && <span className="text-red-600 text-sm">{errors.name}</span>}
      </label>
      <label className="font-semibold mb-1">Location
        <input
          className={`border rounded-lg p-2 w-full focus:ring-2 focus:ring-green-200 focus:border-green-500 transition ${errors.location ? 'border-red-500' : ''}`}
          value={location}
          onChange={e => setLocation(e.target.value)}
          onBlur={() => setTouched(t => ({ ...t, location: true }))}
        />
        {touched.location && errors.location && <span className="text-red-600 text-sm">{errors.location}</span>}
      </label>
      <div className="flex gap-2 mt-2">
        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition" disabled={!name.trim()}>
          Save
        </button>
        <button type="button" className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg font-semibold transition" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

export default function AdminGreenhousesPage() {
  const { data: session, status } = useSession();
  const [greenhouses, setGreenhouses] = useState<Greenhouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editGreenhouse, setEditGreenhouse] = useState<Greenhouse | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      fetch('/api/users')
        .then(res => res.json())
        .then(users => {
          const u = users.find((u: any) => u.id === (session.user as any).id);
          setRole(prev => (prev !== (u?.role || null) ? (u?.role || null) : prev));
        });
    }
  }, [status, session]);

  const fetchGreenhouses = () => {
    setLoading(true);
    fetch('/api/greenhouses')
      .then(res => res.json())
      .then(setGreenhouses)
      .catch(() => setError("Failed to load greenhouses"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchGreenhouses();
  }, []);

  const handleCreate = async (data: NewGreenhouse) => {
    setLoading(true);
    setError(null);
    try {
      await fetch('/api/greenhouses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      setShowForm(false);
      fetchGreenhouses();
    } catch {
      setError("Failed to create greenhouse");
    }
    setLoading(false);
  };

  const handleEdit = async (data: Greenhouse) => {
    setLoading(true);
    setError(null);
    try {
      await fetch('/api/greenhouses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editGreenhouse, ...data }),
      });
      setEditGreenhouse(null);
      fetchGreenhouses();
    } catch {
      setError("Failed to update greenhouse");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this greenhouse?")) return;
    setLoading(true);
    setError(null);
    try {
      await fetch('/api/greenhouses', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      fetchGreenhouses();
    } catch {
      setError("Failed to delete greenhouse");
    }
    setLoading(false);
  };

  if (loading && !showForm && !editGreenhouse) return (
    <div className="p-8">
      <SkeletonTable rows={5} columns={role === 'ADMIN' ? 3 : 2} />
    </div>
  );
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Greenhouses</h1>
        {role === 'ADMIN' && (
          <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold shadow transition text-base" onClick={() => setShowForm(true)}>
            <PlusIcon className="h-5 w-5" />
            Add New Greenhouse
          </button>
        )}
      </div>
      {showForm && (
        <GreenhouseForm onSave={handleCreate} onCancel={() => setShowForm(false)} />
      )}
      {editGreenhouse && (
        <GreenhouseForm
          initial={editGreenhouse}
          onSave={data => handleEdit({ ...editGreenhouse, ...data })}
          onCancel={() => setEditGreenhouse(null)}
        />
      )}
      <table className="table-modern w-full border mt-4 bg-white">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Location</th>
            {role === 'ADMIN' && <th className="p-2 border">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {greenhouses.map(g => (
            <tr key={g.id}>
              <td className="p-2 border">{g.name}</td>
              <td className="p-2 border">{g.location}</td>
              {role === 'ADMIN' && (
                <td className="p-2 border flex gap-2">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg font-semibold transition" onClick={() => setEditGreenhouse(g)}>
                    Edit
                  </button>
                  <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg font-semibold transition" onClick={() => handleDelete(g.id)}>
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