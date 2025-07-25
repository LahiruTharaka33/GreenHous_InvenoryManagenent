import SkeletonTable from "@/app/components/SkeletonTable";

export default function AdminDashboardHome() {
  const loading = false; // Placeholder for actual loading state

  if (loading) {
    return (
      <div className="p-8">
        <SkeletonTable rows={5} columns={3} />
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <p>Welcome! Use the navigation above to manage users, greenhouses, schedules, inventory, and assignments.</p>
    </div>
  );
} 