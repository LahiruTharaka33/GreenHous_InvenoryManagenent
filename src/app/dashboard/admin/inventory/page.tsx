"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from 'react';
import SkeletonTable from "@/app/components/SkeletonTable";
import MobileTable from "@/app/components/MobileTable";
import MobileButton from "@/app/components/MobileButton";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/solid";

interface InventoryItem {
  id: string;
  name: string;
  type: string;
  quantity: number;
  unit: string;
  threshold: number;
}
interface NewInventoryItem {
  name: string;
  type: string;
  quantity: number;
  unit: string;
  threshold: number;
}
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

type InventoryFormProps =
  | { onSave: (data: NewInventoryItem) => void; initial?: undefined; onCancel: () => void }
  | { onSave: (data: Partial<InventoryItem>) => void; initial: InventoryItem; onCancel: () => void };

function InventoryForm({ onSave, onCancel, initial }: InventoryFormProps) {
  const [name, setName] = useState(initial?.name || "");
  const [type, setType] = useState(initial?.type || "FERTILIZER");
  const [quantity, setQuantity] = useState(initial?.quantity || 0);
  const [unit, setUnit] = useState(initial?.unit || "kg");
  const [threshold, setThreshold] = useState(initial?.threshold || 0);
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSave({ name, type, quantity: Number(quantity), unit, threshold: Number(threshold) });
      }}
      className="flex flex-col gap-4 p-4 border rounded-xl bg-white shadow max-w-md"
    >
      <label className="font-semibold mb-1 text-gray-900">Name
        <input className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-green-200 focus:border-green-500 transition text-gray-900" value={name} onChange={e => setName(e.target.value)} required />
      </label>
      <label className="font-semibold mb-1 text-gray-900">Type
        <select className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-green-200 focus:border-green-500 transition text-gray-900" value={type} onChange={e => setType(e.target.value)}>
          <option value="FERTILIZER">Fertilizer</option>
          <option value="SEED">Seed</option>
          <option value="PESTICIDE">Pesticide</option>
          <option value="TOOL">Tool</option>
        </select>
      </label>
      <label className="font-semibold mb-1 text-gray-900">Quantity
        <input className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-green-200 focus:border-green-500 transition text-gray-900" type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} required />
      </label>
      <label className="font-semibold mb-1 text-gray-900">Unit
        <input className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-green-200 focus:border-green-500 transition text-gray-900" value={unit} onChange={e => setUnit(e.target.value)} required />
      </label>
      <label className="font-semibold mb-1 text-gray-900">Low-stock Threshold
        <input className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-green-200 focus:border-green-500 transition text-gray-900" type="number" value={threshold} onChange={e => setThreshold(Number(e.target.value))} required />
      </label>
      <div className="flex gap-2 mt-2">
        <MobileButton type="submit">Save</MobileButton>
        <MobileButton variant="secondary" onClick={onCancel}>Cancel</MobileButton>
      </div>
    </form>
  );
}

export default function AdminInventoryPage() {
  const { data: session, status } = useSession();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
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

  const fetchItems = () => {
    setLoading(true);
    fetch('/api/inventory')
      .then(res => res.json())
      .then(setItems)
      .catch(() => setError("Failed to load inventory"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleCreate = async (data: NewInventoryItem) => {
    setLoading(true);
    setError(null);
    try {
      await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      setShowForm(false);
      fetchItems();
    } catch {
      setError("Failed to create item");
    }
    setLoading(false);
  };

  const handleEdit = async (data: InventoryItem) => {
    setLoading(true);
    setError(null);
    try {
      await fetch('/api/inventory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editItem, ...data }),
      });
      setEditItem(null);
      fetchItems();
    } catch {
      setError("Failed to update item");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    setLoading(true);
    setError(null);
    try {
      await fetch('/api/inventory', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      fetchItems();
    } catch {
      setError("Failed to delete item");
    }
    setLoading(false);
  };

  // Define columns for the inventory table
  const inventoryColumns = [
    { key: "name", label: "Name", mobileLabel: "Name" },
    { key: "type", label: "Type", mobileLabel: "Type" },
    { key: "quantity", label: "Quantity", mobileLabel: "Qty" },
    { key: "unit", label: "Unit", mobileLabel: "Unit" },
    { key: "threshold", label: "Low-stock Threshold", mobileLabel: "Threshold" },
    ...(role === 'ADMIN' ? [{
      key: "actions",
      label: "Actions",
      mobileLabel: "Actions",
      render: (value: any, row: InventoryItem) => (
        <div className="flex gap-2">
          <MobileButton
            size="sm"
            variant="secondary"
            leftIcon={<PencilIcon className="h-4 w-4" />}
            onClick={() => setEditItem(row)}
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

  if (loading && !showForm && !editItem) {
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
        <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
        {role === 'ADMIN' && (
          <MobileButton
            leftIcon={<PlusIcon className="h-5 w-5" />}
            onClick={() => setShowForm(true)}
          >
            Add New Item
          </MobileButton>
        )}
      </div>
      
      {showForm && (
        <div className="mb-6">
          <InventoryForm onSave={handleCreate} onCancel={() => setShowForm(false)} />
        </div>
      )}
      
      {editItem && (
        <div className="mb-6">
          <InventoryForm
            initial={editItem}
            onSave={data => handleEdit({ ...editItem, ...data })}
            onCancel={() => setEditItem(null)}
          />
        </div>
      )}
      
      <MobileTable
        data={items}
        columns={inventoryColumns}
        searchable={true}
        sortable={true}
      />
    </div>
  );
} 