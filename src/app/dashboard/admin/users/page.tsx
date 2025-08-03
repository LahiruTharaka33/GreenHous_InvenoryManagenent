"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from 'react';
import SkeletonTable from "@/app/components/SkeletonTable";
import MobileTable from "@/app/components/MobileTable";
import MobileButton from "@/app/components/MobileButton";
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from "@heroicons/react/24/solid";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  ownedGreenhouses?: {
    id: string;
    name: string;
  }[];
  assignments?: {
    id: string;
    greenhouse: {
      id: string;
      name: string;
    };
  }[];
}

interface NewUser {
  name: string;
  email: string;
  role: string;
  password: string;
}

type UserFormProps =
  | { onSave: (data: NewUser) => void; initial?: undefined; onCancel: () => void }
  | { onSave: (data: Partial<User>) => void; initial: User; onCancel: () => void };

function UserForm({ onSave, onCancel, initial }: UserFormProps) {
  const [name, setName] = useState(initial?.name || "");
  const [email, setEmail] = useState(initial?.email || "");
  const [role, setRole] = useState(initial?.role || "USER");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string; role?: string; password?: string }>({});
  const [touched, setTouched] = useState<{ name?: boolean; email?: boolean; role?: boolean; password?: boolean }>({});

  const validate = () => {
    const fieldErrors: Record<string, string | undefined> = {};
    
    if (!name.trim()) fieldErrors.name = "Name is required";
    if (!email.trim()) fieldErrors.email = "Email is required";
    if (!initial && !password.trim()) fieldErrors.password = "Password is required";
    if (password && password.length < 6) fieldErrors.password = "Password must be at least 6 characters";
    
    setErrors(fieldErrors);
    return Object.keys(fieldErrors).length === 0;
  };

  useEffect(() => {
    if (Object.keys(touched).length > 0) validate();
    // eslint-disable-next-line
  }, [name, email, role, password]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, role: true, password: true });
    if (validate()) {
      if (initial) {
        onSave({ name, email, role });
      } else {
        onSave({ name, email, role, password });
      }
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
      
      <label className="font-semibold mb-1 text-gray-900">Email
        <input
          type="email"
          className={`border rounded-lg p-2 w-full focus:ring-2 focus:ring-green-200 focus:border-green-500 transition text-gray-900 ${errors.email ? 'border-red-500' : ''}`}
          value={email}
          onChange={e => setEmail(e.target.value)}
          onBlur={() => setTouched(t => ({ ...t, email: true }))}
          required
        />
        {touched.email && errors.email && <span className="text-red-600 text-sm">{errors.email}</span>}
      </label>
      
      <label className="font-semibold mb-1 text-gray-900">Role
        <select
          className={`border rounded-lg p-2 w-full focus:ring-2 focus:ring-green-200 focus:border-green-500 transition text-gray-900 ${errors.role ? 'border-red-500' : ''}`}
          value={role}
          onChange={e => setRole(e.target.value)}
          onBlur={() => setTouched(t => ({ ...t, role: true }))}
        >
          <option value="USER">User</option>
          <option value="ADMIN">Admin</option>
        </select>
        {touched.role && errors.role && <span className="text-red-600 text-sm">{errors.role}</span>}
      </label>
      
      {!initial && (
        <label className="font-semibold mb-1 text-gray-900">Password
          <input
            type="password"
            className={`border rounded-lg p-2 w-full focus:ring-2 focus:ring-green-200 focus:border-green-500 transition text-gray-900 ${errors.password ? 'border-red-500' : ''}`}
            value={password}
            onChange={e => setPassword(e.target.value)}
            onBlur={() => setTouched(t => ({ ...t, password: true }))}
            required
          />
          {touched.password && errors.password && <span className="text-red-600 text-sm">{errors.password}</span>}
        </label>
      )}
      
      <div className="flex gap-2 mt-2">
        <MobileButton type="submit" disabled={!name.trim() || !email.trim()}>
          {initial ? 'Update' : 'Create'}
        </MobileButton>
        <MobileButton variant="secondary" onClick={onCancel}>
          Cancel
        </MobileButton>
      </div>
    </form>
  );
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
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

  const fetchUsers = () => {
    setLoading(true);
    fetch('/api/users')
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to load users');
        }
        return res.json();
      })
      .then(setUsers)
      .catch(() => setError("Failed to load users"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (data: NewUser) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create user');
      }
      
      setShowForm(false);
      fetchUsers();
    } catch {
      setError("Failed to create user");
    }
    setLoading(false);
  };

  const handleEdit = async (data: Partial<User>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editUser, ...data }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update user');
      }
      
      setEditUser(null);
      fetchUsers();
    } catch {
      setError("Failed to update user");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
      
      fetchUsers();
    } catch {
      setError("Failed to delete user");
    }
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Define columns for the users table
  const userColumns = [
    { key: "name", label: "Name", mobileLabel: "Name" },
    { key: "email", label: "Email", mobileLabel: "Email" },
    { 
      key: "role", 
      label: "Role", 
      mobileLabel: "Role",
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'ADMIN' 
            ? 'bg-red-100 text-red-800' 
            : 'bg-green-100 text-green-800'
        }`}>
          {value}
        </span>
      )
    },
    { 
      key: "createdAt", 
      label: "Created", 
      mobileLabel: "Created",
      render: (value: string) => formatDate(value)
    },
    { 
      key: "ownedGreenhouses", 
      label: "Owned GH", 
      mobileLabel: "GH",
      render: (value: any, row: User) => {
        const count = row.ownedGreenhouses?.length || 0;
        return count > 0 ? count.toString() : "0";
      }
    },
    { 
      key: "assignments", 
      label: "Assignments", 
      mobileLabel: "Assign",
      render: (value: any, row: User) => {
        const count = row.assignments?.length || 0;
        return count > 0 ? count.toString() : "0";
      }
    },
    ...(role === 'ADMIN' ? [{
      key: "actions",
      label: "Actions",
      mobileLabel: "Actions",
      render: (value: any, row: User) => (
        <div className="flex gap-2">
          <MobileButton
            size="sm"
            variant="secondary"
            leftIcon={<EyeIcon className="h-4 w-4" />}
            onClick={() => setSelectedUser(row)}
          >
            View
          </MobileButton>
          <MobileButton
            size="sm"
            variant="secondary"
            leftIcon={<PencilIcon className="h-4 w-4" />}
            onClick={() => setEditUser(row)}
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

  if (loading && !showForm && !editUser) {
    return (
      <div className="p-4 md:p-8">
        <SkeletonTable rows={5} columns={role === 'ADMIN' ? 7 : 6} />
      </div>
    );
  }
  if (error) return <div className="p-4 md:p-8 text-red-600">{error}</div>;

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
        {role === 'ADMIN' && (
          <MobileButton
            leftIcon={<PlusIcon className="h-5 w-5" />}
            onClick={() => setShowForm(true)}
          >
            Add New User
          </MobileButton>
        )}
      </div>
      
      {showForm && (
        <div className="mb-6">
          <UserForm onSave={handleCreate} onCancel={() => setShowForm(false)} />
        </div>
      )}
      
      {editUser && (
        <div className="mb-6">
          <UserForm
            initial={editUser}
            onSave={data => handleEdit({ ...editUser, ...data })}
            onCancel={() => setEditUser(null)}
          />
        </div>
      )}
      
      {selectedUser && (
        <div className="mb-6 p-6 border rounded-xl bg-white shadow">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold text-gray-900">User Details</h2>
            <MobileButton
              variant="secondary"
              onClick={() => setSelectedUser(null)}
            >
              Close
            </MobileButton>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Basic Information</h3>
              <div className="space-y-2">
                <div><span className="font-medium">Name:</span> {selectedUser.name}</div>
                <div><span className="font-medium">Email:</span> {selectedUser.email}</div>
                <div><span className="font-medium">Role:</span> 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    selectedUser.role === 'ADMIN' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {selectedUser.role}
                  </span>
                </div>
                <div><span className="font-medium">Created:</span> {formatDate(selectedUser.createdAt)}</div>
                <div><span className="font-medium">Updated:</span> {formatDate(selectedUser.updatedAt)}</div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Related Data</h3>
              <div className="space-y-3">
                <div>
                  <span className="font-medium">Owned Greenhouses:</span>
                  {selectedUser.ownedGreenhouses && selectedUser.ownedGreenhouses.length > 0 ? (
                    <ul className="mt-1 ml-4 list-disc">
                      {selectedUser.ownedGreenhouses.map(gh => (
                        <li key={gh.id}>{gh.name}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="ml-2 text-gray-500">None</span>
                  )}
                </div>
                
                <div>
                  <span className="font-medium">Assignments:</span>
                  {selectedUser.assignments && selectedUser.assignments.length > 0 ? (
                    <ul className="mt-1 ml-4 list-disc">
                      {selectedUser.assignments.map(assignment => (
                        <li key={assignment.id}>{assignment.greenhouse.name}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="ml-2 text-gray-500">None</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <MobileTable
        data={users}
        columns={userColumns}
        searchable={true}
        sortable={true}
      />
    </div>
  );
} 