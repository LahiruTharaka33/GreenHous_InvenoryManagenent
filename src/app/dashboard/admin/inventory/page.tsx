"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from 'react';
import SkeletonTable from "@/app/components/SkeletonTable";
import { PlusIcon } from "@heroicons/react/24/solid";

function InventoryForm({ onSave, onCancel, initial }: { onSave: (data: any) => void; onCancel: () => void; initial?: any }) {
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
      <label className="font-semibold mb-1">Name
        <input className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-green-200 focus:border-green-500 transition" value={name} onChange={e => setName(e.target.value)} required />
      </label>
      <label className="font-semibold mb-1">Type
        <select className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-green-200 focus:border-green-500 transition" value={type} onChange={e => setType(e.target.value)}>
          <option value="FERTILIZER">Fertilizer</option>
          <option value="SEED">Seed</option>
          <option value="PESTICIDE">Pesticide</option>
          <option value="TOOL">Tool</option>
        </select>
      </label>
      <label className="font-semibold mb-1">Quantity
        <input className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-green-200 focus:border-green-500 transition" type="number" value={quantity} onChange={e => setQuantity(e.target.value)} required />
      </label>
      <label className="font-semibold mb-1">Unit
        <input className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-green-200 focus:border-green-500 transition" value={unit} onChange={e => setUnit(e.target.value)} required />
      </label>
      <label className="font-semibold mb-1">Low-stock Threshold
        <input className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-green-200 focus:border-green-500 transition" type="number" value={threshold} onChange={e => setThreshold(e.target.value)} required />
      </label>
      <div className="flex gap-2 mt-2">
        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition">Save</button>
        <button type="button" className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg font-semibold transition" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

export default function AdminInventoryPage() {
  const { data: session, status } = useSession();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);
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

  const handleCreate = async (data: any) => {
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

  const handleEdit = async (data: any) => {
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

  if (loading && !showForm && !editItem) {
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
        <h1 className="text-2xl font-bold">Inventory</h1>
        {role === 'ADMIN' && (
          <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold shadow transition text-base" onClick={() => setShowForm(true)}>
            <PlusIcon className="h-5 w-5" />
            Add New Item
          </button>
        )}
      </div>
      {showForm && (
        <InventoryForm onSave={handleCreate} onCancel={() => setShowForm(false)} />
      )}
      {editItem && (
        <InventoryForm initial={editItem} onSave={handleEdit} onCancel={() => setEditItem(null)} />
      )}
      <table className="table-modern w-full border mt-4 bg-white">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Type</th>
            <th className="p-2 border">Quantity</th>
            <th className="p-2 border">Unit</th>
            <th className="p-2 border">Low-stock Threshold</th>
            {role === 'ADMIN' && <th className="p-2 border">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id}>
              <td className="p-2 border">{item.name}</td>
              <td className="p-2 border">{item.type}</td>
              <td className="p-2 border">{item.quantity}</td>
              <td className="p-2 border">{item.unit}</td>
              <td className="p-2 border">{item.threshold}</td>
              {role === 'ADMIN' && (
                <td className="p-2 border flex gap-2">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg font-semibold transition" onClick={() => setEditItem(item)}>
                    Edit
                  </button>
                  <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg font-semibold transition" onClick={() => handleDelete(item.id)}>
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