"use client";
import { useState } from "react";

interface Column {
  key: string;
  label: string;
  mobileLabel?: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

interface MobileTableProps {
  data: any[];
  columns: Column[];
  onRowClick?: (row: any) => void;
  searchable?: boolean;
  sortable?: boolean;
  className?: string;
}

export default function MobileTable({
  data,
  columns,
  onRowClick,
  searchable = false,
  sortable = false,
  className = "",
}: MobileTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Filter data based on search term
  const filteredData = searchable
    ? data.filter((row) =>
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : data;

  // Sort data
  const sortedData = sortable && sortColumn
    ? [...filteredData].sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];
        
        if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
        return 0;
      })
    : filteredData;

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };

  const handleRowClick = (row: any) => {
    if (onRowClick) {
      onRowClick(row);
    }
  };

  return (
    <div className={`w-full mobile-table-container ${className}`}>
      {/* Search Bar */}
      {searchable && (
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[44px] text-gray-900"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      )}

      {/* Mobile Card View */}
      <div className="space-y-3">
        {sortedData.map((row, index) => (
          <div
            key={index}
            onClick={() => handleRowClick(row)}
            className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${
              onRowClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""
            }`}
          >
            <div className="space-y-3">
              {columns.map((column) => {
                const value = row[column.key];
                const displayValue = column.render ? column.render(value, row) : value;
                const label = column.mobileLabel || column.label;
                
                return (
                  <div key={column.key} className="flex justify-between items-start">
                    <span className="text-sm font-medium text-gray-900 min-w-[80px]">
                      {label}:
                    </span>
                    <div className="flex-1 text-right">
                      <span className="text-sm text-gray-900 break-words">
                        {displayValue}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {sortedData.length === 0 && (
        <div className="text-center py-8">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No data found</h3>
          <p className="mt-1 text-sm text-gray-900">
            {searchable && searchTerm ? "Try adjusting your search terms." : "No items to display."}
          </p>
        </div>
      )}

      {/* Desktop Table View (Hidden on Mobile) */}
      <div className="hidden md:block">
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider ${
                      sortable && column.sortable ? "cursor-pointer hover:bg-gray-100" : ""
                    }`}
                    onClick={() => sortable && column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.label}</span>
                      {sortable && column.sortable && sortColumn === column.key && (
                        <svg
                          className={`w-4 h-4 ${
                            sortDirection === "asc" ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 15l7-7 7 7"
                          />
                        </svg>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedData.map((row, index) => (
                <tr
                  key={index}
                  onClick={() => handleRowClick(row)}
                  className={onRowClick ? "cursor-pointer hover:bg-gray-50" : ""}
                >
                  {columns.map((column) => {
                    const value = row[column.key];
                    const displayValue = column.render ? column.render(value, row) : value;
                    
                    return (
                      <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {displayValue}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 