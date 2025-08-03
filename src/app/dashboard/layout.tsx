export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pb-20 md:pb-8">
        {children}
      </main>
    </div>
  );
} 