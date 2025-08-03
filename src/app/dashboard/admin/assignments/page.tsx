"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from 'react';
import { z } from 'zod';
import SkeletonTable from "@/app/components/SkeletonTable";
import MobileTable from "@/app/components/MobileTable";
import MobileButton from "@/app/components/MobileButton";
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from "@heroicons/react/24/solid";

interface Assignment {
  id: string;
  userId: string;
  greenhouseId: string;
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  dueDate?: string;
  assignedAt: string;
  completedAt?: string;
  notes?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  greenhouse?: {
    id: string;
    name: string;
    location?: string;
  };
}

interface NewAssignment {
  userId: string;
  greenhouseId: string;
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  dueDate?: string;
  notes?: string;
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
  location?: string;
}

const assignmentSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
});

type AssignmentFormProps =
  | { onSave: (data: NewAssignment) => void; users: User[]; greenhouses: Greenhouse[]; onCancel: () => void; initial?: undefined }
  | { onSave: (data: Partial<Assignment>) => void; users: User[]; greenhouses: Greenhouse[]; initial: Assignment; onCancel: () => void };

function AssignmentForm({ onSave, onCancel, initial, users, greenhouses }: AssignmentFormProps) {
  const [userId, setUserId] = useState(initial?.userId || (users[0]?.id || ""));
  const [greenhouseId, setGreenhouseId] = useState(initial?.greenhouseId || (greenhouses[0]?.id || ""));
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [priority, setPriority] = useState(initial?.priority || "MEDIUM");
  const [status, setStatus] = useState(initial?.status || "PENDING");
  const [dueDate, setDueDate] = useState(initial?.dueDate ? initial.dueDate.slice(0, 10) : "");
  const [notes, setNotes] = useState(initial?.notes || "");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const validate = () => {
    const result = assignmentSchema.safeParse({ title, description, priority, status, dueDate, notes });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
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
  }, [title, description, priority, status, dueDate, notes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ title: true, description: true, priority: true, status: true, dueDate: true, notes: true });
    if (validate()) {
      onSave({ 
        userId, 
        greenhouseId, 
        title, 
        description: description || undefined,
        priority: priority as any,
        status: status as any,
        dueDate: dueDate || undefined,
        notes: notes || undefined
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 border rounded-xl bg-white shadow max-w-md">
      <label className="font-semibold mb-1 text-gray-900">Task Title
        <input
          className={`border rounded-lg p-2 w-full focus:ring-2 focus:ring-green-200 focus:border-green-500 transition text-gray-900 ${errors.title ? 'border-red-500' : ''}`}
          value={title}
          onChange={e => setTitle(e.target.value)}
          onBlur={() => setTouched(t => ({ ...t, title: true }))}
          required
        />
        {touched.title && errors.title && <span className="text-red-600 text-sm">{errors.title}</span>}
      </label>

      <label className="font-semibold mb-1 text-gray-900">Description
        <textarea
          className={`border rounded-lg p-2 w-full focus:ring-2 focus:ring-green-200 focus:border-green-500 transition text-gray-900 ${errors.description ? 'border-red-500' : ''}`}
          value={description}
          onChange={e => setDescription(e.target.value)}
          onBlur={() => setTouched(t => ({ ...t, description: true }))}
          rows={3}
        />
        {touched.description && errors.description && <span className="text-red-600 text-sm">{errors.description}</span>}
      </label>

      <label className="font-semibold mb-1 text-gray-900">Assigned User
        <select 
          className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-green-200 focus:border-green-500 transition text-gray-900" 
          value={userId} 
          onChange={e => setUserId(e.target.value)} 
          required
        >
          {users.map(u => (
            <option key={u.id} value={u.id}>{u.name || u.email}</option>
          ))}
        </select>
      </label>

      <label className="font-semibold mb-1 text-gray-900">Tunnel (Greenhouse)
        <select 
          className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-green-200 focus:border-green-500 transition text-gray-900" 
          value={greenhouseId} 
          onChange={e => setGreenhouseId(e.target.value)} 
          required
        >
          {greenhouses.map(g => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="font-semibold mb-1 text-gray-900">Priority
          <select
            className={`border rounded-lg p-2 w-full focus:ring-2 focus:ring-green-200 focus:border-green-500 transition text-gray-900 ${errors.priority ? 'border-red-500' : ''}`}
            value={priority}
            onChange={e => setPriority(e.target.value)}
            onBlur={() => setTouched(t => ({ ...t, priority: true }))}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
          {touched.priority && errors.priority && <span className="text-red-600 text-sm">{errors.priority}</span>}
        </label>

        <label className="font-semibold mb-1 text-gray-900">Status
          <select
            className={`border rounded-lg p-2 w-full focus:ring-2 focus:ring-green-200 focus:border-green-500 transition text-gray-900 ${errors.status ? 'border-red-500' : ''}`}
            value={status}
            onChange={e => setStatus(e.target.value)}
            onBlur={() => setTouched(t => ({ ...t, status: true }))}
          >
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          {touched.status && errors.status && <span className="text-red-600 text-sm">{errors.status}</span>}
        </label>
      </div>

      <label className="font-semibold mb-1 text-gray-900">Due Date
        <input
          type="date"
          className={`border rounded-lg p-2 w-full focus:ring-2 focus:ring-green-200 focus:border-green-500 transition text-gray-900 ${errors.dueDate ? 'border-red-500' : ''}`}
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          onBlur={() => setTouched(t => ({ ...t, dueDate: true }))}
        />
        {touched.dueDate && errors.dueDate && <span className="text-red-600 text-sm">{errors.dueDate}</span>}
      </label>

      <label className="font-semibold mb-1 text-gray-900">Notes
        <textarea
          className={`border rounded-lg p-2 w-full focus:ring-2 focus:ring-green-200 focus:border-green-500 transition text-gray-900 ${errors.notes ? 'border-red-500' : ''}`}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          onBlur={() => setTouched(t => ({ ...t, notes: true }))}
          rows={2}
        />
        {touched.notes && errors.notes && <span className="text-red-600 text-sm">{errors.notes}</span>}
      </label>

      <div className="flex gap-2 mt-2">
        <MobileButton type="submit" disabled={!title.trim()}>
          {initial ? 'Update' : 'Create'} Task
        </MobileButton>
        <MobileButton variant="secondary" onClick={onCancel}>
          Cancel
        </MobileButton>
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
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
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
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to load assignments');
        }
        return res.json();
      })
      .then(setAssignments)
      .catch(() => setError("Failed to load assignments"))
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

  const fetchGreenhouses = () => {
    fetch('/api/greenhouses')
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to load greenhouses');
        }
        return res.json();
      })
      .then(setGreenhouses)
      .catch(() => setError("Failed to load greenhouses"));
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
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create assignment');
      }
      
      setShowForm(false);
      fetchAssignments();
    } catch {
      setError("Failed to create assignment");
    }
    setLoading(false);
  };

  const handleEdit = async (data: Partial<Assignment>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/assignments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editAssignment, ...data }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update assignment');
      }
      
      setEditAssignment(null);
      fetchAssignments();
    } catch {
      setError("Failed to update assignment");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this task assignment?")) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/assignments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete assignment');
      }
      
      fetchAssignments();
    } catch {
      setError("Failed to delete assignment");
    }
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'bg-gray-100 text-gray-800';
      case 'MEDIUM': return 'bg-blue-100 text-blue-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'URGENT': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Define columns for the assignments table
  const assignmentColumns = [
    { 
      key: "title", 
      label: "Task", 
      mobileLabel: "Task",
      render: (value: string, row: Assignment) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          {row.description && (
            <div className="text-sm text-gray-500 truncate max-w-xs">{row.description}</div>
          )}
        </div>
      )
    },
    { 
      key: "user", 
      label: "Assigned To", 
      mobileLabel: "User",
      render: (value: any, row: Assignment) => {
        const user = row.user || users.find(u => u.id === row.userId);
        return user ? (user.name || user.email) : 'Unknown';
      }
    },
    { 
      key: "greenhouse", 
      label: "Tunnel", 
      mobileLabel: "Tunnel",
      render: (value: any, row: Assignment) => {
        const greenhouse = row.greenhouse || greenhouses.find(g => g.id === row.greenhouseId);
        return greenhouse ? greenhouse.name : 'Unknown';
      }
    },
    { 
      key: "priority", 
      label: "Priority", 
      mobileLabel: "Priority",
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(value)}`}>
          {value}
        </span>
      )
    },
    { 
      key: "status", 
      label: "Status", 
      mobileLabel: "Status",
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
          {value.replace('_', ' ')}
        </span>
      )
    },
    { 
      key: "dueDate", 
      label: "Due Date", 
      mobileLabel: "Due",
      render: (value: string) => value ? formatDate(value) : 'No due date'
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
            leftIcon={<EyeIcon className="h-4 w-4" />}
            onClick={() => setSelectedAssignment(row)}
          >
            View
          </MobileButton>
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
        <SkeletonTable rows={5} columns={role === 'ADMIN' ? 7 : 6} />
      </div>
    );
  }
  if (error) return <div className="p-4 md:p-8 text-red-600">{error}</div>;

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Task Assignments</h1>
        {role === 'ADMIN' && (
          <MobileButton
            leftIcon={<PlusIcon className="h-5 w-5" />}
            onClick={() => setShowForm(true)}
          >
            Assign New Task
          </MobileButton>
        )}
      </div>
      
      {showForm && (
        <div className="mb-6">
          {users.length === 0 || greenhouses.length === 0 ? (
            <div className="p-4 border rounded-xl bg-white shadow max-w-md">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          ) : (
            <AssignmentForm users={users} greenhouses={greenhouses} onSave={handleCreate} onCancel={() => setShowForm(false)} />
          )}
        </div>
      )}
      
      {editAssignment && (
        <div className="mb-6">
          {users.length === 0 || greenhouses.length === 0 ? (
            <div className="p-4 border rounded-xl bg-white shadow max-w-md">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          ) : (
            <AssignmentForm
              users={users}
              greenhouses={greenhouses}
              initial={editAssignment}
              onSave={data => handleEdit({ ...editAssignment, ...data })}
              onCancel={() => setEditAssignment(null)}
            />
          )}
        </div>
      )}
      
      {selectedAssignment && (
        <div className="mb-6 p-6 border rounded-xl bg-white shadow">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold text-gray-900">Task Details</h2>
            <MobileButton
              variant="secondary"
              onClick={() => setSelectedAssignment(null)}
            >
              Close
            </MobileButton>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Task Information</h3>
              <div className="space-y-2">
                <div><span className="font-medium">Title:</span> {selectedAssignment.title}</div>
                {selectedAssignment.description && (
                  <div><span className="font-medium">Description:</span> {selectedAssignment.description}</div>
                )}
                <div><span className="font-medium">Priority:</span> 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedAssignment.priority)}`}>
                    {selectedAssignment.priority}
                  </span>
                </div>
                <div><span className="font-medium">Status:</span> 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedAssignment.status)}`}>
                    {selectedAssignment.status.replace('_', ' ')}
                  </span>
                </div>
                <div><span className="font-medium">Due Date:</span> {selectedAssignment.dueDate ? formatDate(selectedAssignment.dueDate) : 'No due date'}</div>
                {selectedAssignment.notes && (
                  <div><span className="font-medium">Notes:</span> {selectedAssignment.notes}</div>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Assignment Details</h3>
              <div className="space-y-2">
                <div><span className="font-medium">Assigned To:</span> {
                  selectedAssignment.user ? (selectedAssignment.user.name || selectedAssignment.user.email) : 
                  users.find(u => u.id === selectedAssignment.userId)?.name || 'Unknown'
                }</div>
                <div><span className="font-medium">Tunnel:</span> {
                  selectedAssignment.greenhouse ? selectedAssignment.greenhouse.name :
                  greenhouses.find(g => g.id === selectedAssignment.greenhouseId)?.name || 'Unknown'
                }</div>
                <div><span className="font-medium">Assigned:</span> {formatDate(selectedAssignment.assignedAt)}</div>
                {selectedAssignment.completedAt && (
                  <div><span className="font-medium">Completed:</span> {formatDate(selectedAssignment.completedAt)}</div>
                )}
              </div>
            </div>
          </div>
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