"use client";
import { useEffect, useState } from 'react';
import MobileTable from "@/app/components/MobileTable";

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

  // Define columns for the user inventory table
  const inventoryColumns = [
    { key: "name", label: "Name", mobileLabel: "Name" },
    { key: "type", label: "Type", mobileLabel: "Type" },
    { key: "quantity", label: "Quantity", mobileLabel: "Qty" },
    { key: "unit", label: "Unit", mobileLabel: "Unit" },
    { key: "threshold", label: "Low-stock Threshold", mobileLabel: "Threshold" }
  ];

  if (loading) return <div className="p-4 md:p-8">Loading...</div>;
  if (error) return <div className="p-4 md:p-8 text-red-600">{error}</div>;

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Inventory</h1>
      <MobileTable
        data={items}
        columns={inventoryColumns}
        searchable={true}
        sortable={true}
      />
    </div>
  );
} 