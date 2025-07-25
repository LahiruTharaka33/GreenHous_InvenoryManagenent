"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function UserDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (status !== "authenticated") {
      router.replace("/auth/signin");
    }
  }, [status, router]);

  if (status !== "authenticated") {
    return <div>Loading...</div>;
  }

  return <div className="p-8">Welcome to your User Dashboard, {session.user?.name || session.user?.email}!</div>;
} 