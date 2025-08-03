"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from 'react';
import SkeletonTable from "@/app/components/SkeletonTable";
import MobileTable from "@/app/components/MobileTable";
import MobileButton from "@/app/components/MobileButton";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/solid";

interface Assignment {
  id: string;
  userId: string;
  greenhouseId: string;
  assignedAt?: string;
}
interface NewAssignment {
  userId: string;
  greenhouseId: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Greenhouse {
  id: string;
  name: string;
}

type AssignmentFormProps =
  | { onSave: (data: NewAssignment) => void; users: User[]; greenhouses: Greenhouse[]; onCancel: () => void; initial?: undefined }
  | { onSave: (data: Partial<Assignment>) => void; users: User[]; greenhouses: Greenhouse[]; initial: Assignment; onCancel: () => void };

function AssignmentForm({ onSave, onCancel, initial, users, greenhouses }: AssignmentFormProps) {
  const [userId, setUserId] = useState(initial?.userId || (users[0]?.id || ""));
  const [greenhouseId, setGreenhouseId] = useState(initial?.greenhouseId || (greenhouses[0]?.id || ""));
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSave({ userId, greenhouseId });
      }}
      className="flex flex-col gap-4 p-4 border rounded-xl bg-white shadow max-w-md"
    >
      <label className="font-semibold mb-1 text-gray-900">User
        <select className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-green-200 focus:border-green-500 transition text-gray-900" value={userId} onChange={e => setUserId(e.target.value)} required>
          {users.map(u => (
            <option key={u.id} value={u.id}>{u.name || u.email}</option>
          ))}
        </select>
      </label>
      <label className="font-semibold mb-1 text-gray-900">Greenhouse
        <select className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-green-200 focus:border-green-500 transition text-gray-900" value={greenhouseId} onChange={e => setGreenhouseId(e.target.value)} required>
          {greenhouses.map(g => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
      </label>
      <div className="flex gap-2 mt-2">
        <MobileButton type="submit">Save</MobileButton>
        <MobileButton variant="secondary" onClick={onCancel}>Cancel</MobileButton>
      </div>
    </form>
  );
}

export default function AdminAssignmentsPage() {
  const { data: session, status } = useSession();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [greenhouses, setGreenhouses] = useState<Greenhouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editAssignment, setEditAssignment] = useState<Assignment | null>(null);
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

  const fetchAssignments = () => {
    setLoading(true);
    fetch('/api/assignments')
      .then(res => res.json())
      .then(setAssignments)
      .catch(() => setError("Failed to load assignments"))
      .finally(() => setLoading(false));
  };

  const fetchUsers = () => {
    fetch('/api/users')
      .then(res => res.json())
      .then(setUsers);
  };

  const fetchGreenhouses = () => {
    fetch('/api/greenhouses')
      .then(res => res.json())
      .then(setGreenhouses);
  };

  useEffect(() => {
    fetchAssignments();
    fetchUsers();
    fetchGreenhouses();
  }, []);

  const handleCreate = async (data: NewAssignment) => {
    setLoading(true);
    setError(null);
    try {
      await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      setShowForm(false);
      fetchAssignments();
    } catch {
      setError("Failed to create assignment");
    }
    setLoading(false);
  };

  const handleEdit = async (data: Assignment) => {
    setLoading(true);
    setError(null);
    try {
      await fetch('/api/assignments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editAssignment, ...data }),
      });
      setEditAssignment(null);
      fetchAssignments();
    } catch {
      setError("Failed to update assignment");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this assignment?")) return;
    setLoading(true);
    setError(null);
    try {
      await fetch('/api/assignments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      fetchAssignments();
    } catch {
      setError("Failed to delete assignment");
    }
    setLoading(false);
  };

  // Define columns for the assignments table
  const assignmentColumns = [
    { 
      key: "userId", 
      label: "User", 
      mobileLabel: "User",
      render: (value: string) => users.find(u => u.id === value)?.name || users.find(u => u.id === value)?.email || value
    },
    { 
      key: "greenhouseId", 
      label: "Greenhouse", 
      mobileLabel: "GH",
      render: (value: string) => greenhouses.find(g => g.id === value)?.name || value
    },
    ...(role === 'ADMIN' ? [{
      key: "actions",
      label: "Actions",
      mobileLabel: "Actions",
      render: (value: any, row: Assignment) => (
        <div className="flex gap-2">
          <MobileButton
            size="sm"
            variant="secondary"
            leftIcon={<PencilIcon className="h-4 w-4" />}
            onClick={() => setEditAssignment(row)}
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

  if (loading && !showForm && !editAssignment) {
    return (
      <div className="p-4 md:p-8">
        <SkeletonTable rows={5} columns={role === 'ADMIN' ? 3 : 2} />
      </div>
    );
  }
  if (error) return <div className="p-4 md:p-8 text-red-600">{error}</div>;

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
        {role === 'ADMIN' && (
          <MobileButton
            leftIcon={<PlusIcon className="h-5 w-5" />}
            onClick={() => setShowForm(true)}
          >
            Add New Assignment
          </MobileButton>
        )}
      </div>
      
      {showForm && (
        <div className="mb-6">
          <AssignmentForm users={users} greenhouses={greenhouses} onSave={handleCreate} onCancel={() => setShowForm(false)} />
        </div>
      )}
      
      {editAssignment && (
        <div className="mb-6">
          <AssignmentForm
            users={users}
            greenhouses={greenhouses}
            initial={editAssignment}
            onSave={data => handleEdit({ ...editAssignment, ...data })}
            onCancel={() => setEditAssignment(null)}
          />
        </div>
      )}
      
      <MobileTable
        data={assignments}
        columns={assignmentColumns}
        searchable={true}
        sortable={true}
      />
    </div>
  );
} 