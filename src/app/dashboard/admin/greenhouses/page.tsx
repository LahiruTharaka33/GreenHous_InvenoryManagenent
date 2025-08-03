"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from 'react';
import { z } from 'zod';
import SkeletonTable from "@/app/components/SkeletonTable";
import MobileTable from "@/app/components/MobileTable";
import MobileButton from "@/app/components/MobileButton";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/solid";

interface Greenhouse {
  id: string;
  name: string;
  location?: string;
  ownerId?: string;
  owner?: {
    id: string;
    name: string;
    email: string;
  };
}
interface NewGreenhouse {
  name: string;
  location?: string;
  ownerId?: string;
}
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const greenhouseSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  location: z.string().optional(),
  ownerId: z.string().optional(),
});

type GreenhouseFormProps =
  | { onSave: (data: NewGreenhouse) => void; initial?: undefined; users: User[]; onCancel: () => void }
  | { onSave: (data: Partial<Greenhouse>) => void; initial: Greenhouse; users: User[]; onCancel: () => void };

function GreenhouseForm({ onSave, onCancel, initial, users }: GreenhouseFormProps) {
  const [name, setName] = useState(initial?.name || "");
  const [location, setLocation] = useState(initial?.location || "");
  const [ownerId, setOwnerId] = useState(initial?.ownerId || "");
  const [errors, setErrors] = useState<{ name?: string; location?: string; ownerId?: string }>({});
  const [touched, setTouched] = useState<{ name?: boolean; location?: boolean; ownerId?: boolean }>({});

  const validate = () => {
    const result = greenhouseSchema.safeParse({ name, location, ownerId: ownerId || undefined });
    if (!result.success) {
      const fieldErrors: Record<string, string | undefined> = {};
      for (const err of result.error.issues) {
        const key = err.path[0];
        if (typeof key === 'string') {
          fieldErrors[key] = err.message;
        }
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
  }, [name, location, ownerId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, location: true, ownerId: true });
    if (validate()) {
      onSave({ name, location, ownerId: ownerId || undefined });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 border rounded-xl bg-white shadow max-w-md">
      <label className="font-semibold mb-1 text-gray-900">Name
        <input
          className={`border rounded-lg p-2 w-full focus:ring-2 focus:ring-green-200 focus:border-green-500 transition text-gray-900 ${errors.name ? 'border-red-500' : ''}`}
          value={name}
          onChange={e => setName(e.target.value)}
          onBlur={() => setTouched(t => ({ ...t, name: true }))}
          required
        />
        {touched.name && errors.name && <span className="text-red-600 text-sm">{errors.name}</span>}
      </label>
      <label className="font-semibold mb-1 text-gray-900">Location
        <input
          className={`border rounded-lg p-2 w-full focus:ring-2 focus:ring-green-200 focus:border-green-500 transition text-gray-900 ${errors.location ? 'border-red-500' : ''}`}
          value={location}
          onChange={e => setLocation(e.target.value)}
          onBlur={() => setTouched(t => ({ ...t, location: true }))}
        />
        {touched.location && errors.location && <span className="text-red-600 text-sm">{errors.location}</span>}
      </label>
      <label className="font-semibold mb-1 text-gray-900">Owner (Optional)
        <select
          className={`border rounded-lg p-2 w-full focus:ring-2 focus:ring-green-200 focus:border-green-500 transition text-gray-900 ${errors.ownerId ? 'border-red-500' : ''}`}
          value={ownerId}
          onChange={e => setOwnerId(e.target.value)}
          onBlur={() => setTouched(t => ({ ...t, ownerId: true }))}
        >
          <option value="">No Owner</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.name || user.email}
            </option>
          ))}
        </select>
        {touched.ownerId && errors.ownerId && <span className="text-red-600 text-sm">{errors.ownerId}</span>}
      </label>
      <div className="flex gap-2 mt-2">
        <MobileButton type="submit" disabled={!name.trim()}>
          Save
        </MobileButton>
        <MobileButton variant="secondary" onClick={onCancel}>
          Cancel
        </MobileButton>
      </div>
    </form>
  );
}

export default function AdminGreenhousesPage() {
  const { data: session, status } = useSession();
  const [greenhouses, setGreenhouses] = useState<Greenhouse[]>([]);
  const [users, setUsers] = useState<User[]>([]);
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
          const u = users.find((u: User) => u.id === (session.user as User).id);
          setRole(prev => (prev !== (u?.role || null) ? (u?.role || null) : prev));
        });
    }
  }, [status, session]);

  const fetchGreenhouses = () => {
    setLoading(true);
    fetch('/api/greenhouses')
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to load greenhouses');
        }
        return res.json();
      })
      .then(setGreenhouses)
      .catch(() => setError("Failed to load greenhouses"))
      .finally(() => setLoading(false));
  };

  const fetchUsers = () => {
    fetch('/api/users')
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to load users');
        }
        return res.json();
      })
      .then(setUsers)
      .catch(() => setError("Failed to load users"));
  };

  useEffect(() => {
    fetchGreenhouses();
    fetchUsers();
  }, []);

  const handleCreate = async (data: NewGreenhouse) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/greenhouses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create greenhouse');
      }
      
      setShowForm(false);
      fetchGreenhouses();
    } catch {
      setError("Failed to create greenhouse");
    }
    setLoading(false);
  };

  const handleEdit = async (data: Partial<Greenhouse>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/greenhouses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editGreenhouse, ...data }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update greenhouse');
      }
      
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
      const response = await fetch('/api/greenhouses', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete greenhouse');
      }
      
      fetchGreenhouses();
    } catch {
      setError("Failed to delete greenhouse");
    }
    setLoading(false);
  };

  // Define columns for the greenhouses table
  const greenhouseColumns = [
    { key: "name", label: "Name", mobileLabel: "Name" },
    { key: "location", label: "Location", mobileLabel: "Location" },
    { 
      key: "owner", 
      label: "Owner", 
      mobileLabel: "Owner",
      render: (value: any, row: Greenhouse) => {
        if (row.owner) {
          return row.owner.name || row.owner.email;
        }
        return "No Owner";
      }
    },
    ...(role === 'ADMIN' ? [{
      key: "actions",
      label: "Actions",
      mobileLabel: "Actions",
      render: (value: any, row: Greenhouse) => (
        <div className="flex gap-2">
          <MobileButton
            size="sm"
            variant="secondary"
            leftIcon={<PencilIcon className="h-4 w-4" />}
            onClick={() => setEditGreenhouse(row)}
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

  if (loading && !showForm && !editGreenhouse) return (
    <div className="p-4 md:p-8">
      <SkeletonTable rows={5} columns={role === 'ADMIN' ? 4 : 3} />
    </div>
  );
  if (error) return <div className="p-4 md:p-8 text-red-600">{error}</div>;

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Greenhouses</h1>
        {role === 'ADMIN' && (
          <MobileButton
            leftIcon={<PlusIcon className="h-5 w-5" />}
            onClick={() => setShowForm(true)}
          >
            Add New Greenhouse
          </MobileButton>
        )}
      </div>
      
      {showForm && (
        <div className="mb-6">
          {users.length === 0 ? (
            <div className="p-4 border rounded-xl bg-white shadow max-w-md">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          ) : (
            <GreenhouseForm users={users} onSave={handleCreate} onCancel={() => setShowForm(false)} />
          )}
        </div>
      )}
      
      {editGreenhouse && (
        <div className="mb-6">
          {users.length === 0 ? (
            <div className="p-4 border rounded-xl bg-white shadow max-w-md">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          ) : (
            <GreenhouseForm
              users={users}
              initial={editGreenhouse}
              onSave={data => handleEdit({ ...editGreenhouse, ...data })}
              onCancel={() => setEditGreenhouse(null)}
            />
          )}
        </div>
      )}
      
      <MobileTable
        data={greenhouses}
        columns={greenhouseColumns}
        searchable={true}
        sortable={true}
      />
    </div>
  );
} 