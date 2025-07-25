"use client";
import { useEffect, useState } from 'react';

interface InventoryItem {
  id: string;
  name: string;
  type: string;
  quantity: number;
  unit: string;
  threshold: number;
}

export default function UserInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Inventory</h1>
      <table className="w-full border mt-4 bg-white">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Type</th>
            <th className="p-2 border">Quantity</th>
            <th className="p-2 border">Unit</th>
            <th className="p-2 border">Low-stock Threshold</th>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 