"use client";
import { ReactNode } from "react";

interface MobileTableProps {
  children: ReactNode;
  className?: string;
}

export default function MobileTable({ children, className = "" }: MobileTableProps) {
  return (
    <div className={`table-container ${className}`}>
      <table className="table-modern w-full">
        {children}
      </table>
    </div>
  );
}

interface MobileTableHeaderProps {
  children: ReactNode;
  className?: string;
}

export function MobileTableHeader({ children, className = "" }: MobileTableHeaderProps) {
  return (
    <thead className={className}>
      {children}
    </thead>
  );
}

interface MobileTableBodyProps {
  children: ReactNode;
  className?: string;
}

export function MobileTableBody({ children, className = "" }: MobileTableBodyProps) {
  return (
    <tbody className={className}>
      {children}
    </tbody>
  );
}

interface MobileTableRowProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function MobileTableRow({ children, className = "", onClick }: MobileTableRowProps) {
  return (
    <tr 
      className={`${onClick ? 'cursor-pointer hover:bg-green-50' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

interface MobileTableCellProps {
  children: ReactNode;
  className?: string;
  isHeader?: boolean;
}

export function MobileTableCell({ children, className = "", isHeader = false }: MobileTableCellProps) {
  const Component = isHeader ? 'th' : 'td';
  return (
    <Component className={`${className} ${isHeader ? 'font-semibold' : ''}`}>
      {children}
    </Component>
  );
} 