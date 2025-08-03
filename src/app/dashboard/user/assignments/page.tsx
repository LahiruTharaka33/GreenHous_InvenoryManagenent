"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from 'react';
import SkeletonTable from "@/app/components/SkeletonTable";
import MobileTable from "@/app/components/MobileTable";
import MobileButton from "@/app/components/MobileButton";
import { EyeIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";

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

export default function UserAssignmentsPage() {
  const { data: session, status } = useSession();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [greenhouses, setGreenhouses] = useState<Greenhouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      fetch('/api/users')
        .then(res => res.json())
        .then(users => {
          const u = users.find((u: User) => u.id === (session.user as User).id);
          setCurrentUserId(u?.id || null);
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
      .then(data => {
        // Filter assignments for current user only
        if (currentUserId) {
          setAssignments(data.filter((assignment: Assignment) => assignment.userId === currentUserId));
        } else {
          setAssignments([]);
        }
      })
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
    if (currentUserId) {
      fetchAssignments();
    }
    fetchUsers();
    fetchGreenhouses();
  }, [currentUserId]);

  const handleStatusUpdate = async (assignmentId: string, newStatus: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/assignments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: assignmentId, 
          status: newStatus,
          completedAt: newStatus === 'COMPLETED' ? new Date().toISOString() : null
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update task status');
      }
      
      fetchAssignments();
      setSelectedAssignment(null);
    } catch {
      setError("Failed to update task status");
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

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
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
      render: (value: string) => {
        if (!value) return 'No due date';
        const overdue = isOverdue(value);
        return (
          <span className={overdue ? 'text-red-600 font-medium' : ''}>
            {formatDate(value)}
            {overdue && <span className="ml-1 text-xs">(Overdue)</span>}
          </span>
        );
      }
    },
    {
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
          {row.status === 'PENDING' && (
            <MobileButton
              size="sm"
              variant="primary"
              leftIcon={<CheckIcon className="h-4 w-4" />}
              onClick={() => handleStatusUpdate(row.id, 'IN_PROGRESS')}
            >
              Start
            </MobileButton>
          )}
          {row.status === 'IN_PROGRESS' && (
            <MobileButton
              size="sm"
              variant="success"
              leftIcon={<CheckIcon className="h-4 w-4" />}
              onClick={() => handleStatusUpdate(row.id, 'COMPLETED')}
            >
              Complete
            </MobileButton>
          )}
          {(row.status === 'PENDING' || row.status === 'IN_PROGRESS') && (
            <MobileButton
              size="sm"
              variant="danger"
              leftIcon={<XMarkIcon className="h-4 w-4" />}
              onClick={() => handleStatusUpdate(row.id, 'CANCELLED')}
            >
              Cancel
            </MobileButton>
          )}
        </div>
      )
    }
  ];

  if (loading && !selectedAssignment) {
    return (
      <div className="p-4 md:p-8">
        <SkeletonTable rows={5} columns={6} />
      </div>
    );
  }
  if (error) return <div className="p-4 md:p-8 text-red-600">{error}</div>;

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Task Assignments</h1>
        <div className="text-sm text-gray-600">
          {assignments.length} task{assignments.length !== 1 ? 's' : ''} assigned
        </div>
      </div>
      
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
                <div><span className="font-medium">Tunnel:</span> {
                  selectedAssignment.greenhouse ? selectedAssignment.greenhouse.name :
                  greenhouses.find(g => g.id === selectedAssignment.greenhouseId)?.name || 'Unknown'
                }</div>
                <div><span className="font-medium">Assigned:</span> {formatDate(selectedAssignment.assignedAt)}</div>
                {selectedAssignment.completedAt && (
                  <div><span className="font-medium">Completed:</span> {formatDate(selectedAssignment.completedAt)}</div>
                )}
              </div>
              
              {(selectedAssignment.status === 'PENDING' || selectedAssignment.status === 'IN_PROGRESS') && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-semibold text-gray-900 mb-2">Update Status</h4>
                  <div className="flex gap-2">
                    {selectedAssignment.status === 'PENDING' && (
                      <MobileButton
                        size="sm"
                        variant="primary"
                        leftIcon={<CheckIcon className="h-4 w-4" />}
                        onClick={() => handleStatusUpdate(selectedAssignment.id, 'IN_PROGRESS')}
                      >
                        Start Task
                      </MobileButton>
                    )}
                    {selectedAssignment.status === 'IN_PROGRESS' && (
                      <MobileButton
                        size="sm"
                        variant="success"
                        leftIcon={<CheckIcon className="h-4 w-4" />}
                        onClick={() => handleStatusUpdate(selectedAssignment.id, 'COMPLETED')}
                      >
                        Mark Complete
                      </MobileButton>
                    )}
                    <MobileButton
                      size="sm"
                      variant="danger"
                      leftIcon={<XMarkIcon className="h-4 w-4" />}
                      onClick={() => handleStatusUpdate(selectedAssignment.id, 'CANCELLED')}
                    >
                      Cancel Task
                    </MobileButton>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {assignments.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">No tasks assigned to you</div>
          <div className="text-gray-400">You'll see your assigned tasks here when they become available.</div>
        </div>
      ) : (
        <MobileTable
          data={assignments}
          columns={assignmentColumns}
          searchable={true}
          sortable={true}
        />
      )}
    </div>
  );
} 