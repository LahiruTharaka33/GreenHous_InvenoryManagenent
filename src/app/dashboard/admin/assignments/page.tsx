"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from 'react';
import SkeletonTable from "@/app/components/SkeletonTable";
import { PlusIcon } from "@heroicons/react/24/solid";

function AssignmentForm({ onSave, onCancel, initial, users, greenhouses }: { onSave: (data: any) => void; onCancel: () => void; initial?: any; users: any[]; greenhouses: any[] }) {
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
      <label className="font-semibold mb-1">User
        <select className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-green-200 focus:border-green-500 transition" value={userId} onChange={e => setUserId(e.target.value)} required>
          {users.map(u => (
            <option key={u.id} value={u.id}>{u.name || u.email}</option>
          ))}
        </select>
      </label>
      <label className="font-semibold mb-1">Greenhouse
        <select className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-green-200 focus:border-green-500 transition" value={greenhouseId} onChange={e => setGreenhouseId(e.target.value)} required>
          {greenhouses.map(g => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
      </label>
      <div className="flex gap-2 mt-2">
        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition">Save</button>
        <button type="button" className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg font-semibold transition" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

export default function AdminAssignmentsPage() {
  const { data: session, status } = useSession();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [greenhouses, setGreenhouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editAssignment, setEditAssignment] = useState<any | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      fetch('/api/users')
        .then(res => res.json())
        .then(users => {
          const u = users.find((u: any) => u.id === (session.user as any).id);
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

  const handleCreate = async (data: any) => {
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

  const handleEdit = async (data: any) => {
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

  if (loading && !showForm && !editAssignment) {
    return (
      <div className="p-8">
        <SkeletonTable rows={5} columns={role === 'ADMIN' ? 3 : 2} />
      </div>
    );
  }
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Assignments</h1>
        {role === 'ADMIN' && (
          <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold shadow transition text-base" onClick={() => setShowForm(true)}>
            <PlusIcon className="h-5 w-5" />
            Add New Assignment
          </button>
        )}
      </div>
      {showForm && (
        <AssignmentForm users={users} greenhouses={greenhouses} onSave={handleCreate} onCancel={() => setShowForm(false)} />
      )}
      {editAssignment && (
        <AssignmentForm users={users} greenhouses={greenhouses} initial={editAssignment} onSave={handleEdit} onCancel={() => setEditAssignment(null)} />
      )}
      <table className="table-modern w-full border mt-4 bg-white">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">User</th>
            <th className="p-2 border">Greenhouse</th>
            {role === 'ADMIN' && <th className="p-2 border">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {assignments.map(a => (
            <tr key={a.id}>
              <td className="p-2 border">{users.find(u => u.id === a.userId)?.name || a.userId}</td>
              <td className="p-2 border">{greenhouses.find(g => g.id === a.greenhouseId)?.name || a.greenhouseId}</td>
              {role === 'ADMIN' && (
                <td className="p-2 border flex gap-2">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg font-semibold transition" onClick={() => setEditAssignment(a)}>
                    Edit
                  </button>
                  <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg font-semibold transition" onClick={() => handleDelete(a.id)}>
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