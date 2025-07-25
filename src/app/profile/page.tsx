"use client";
import { useSession } from "next-auth/react";

export default function ProfilePage() {
  const { data: session, status } = useSession();

  if (status === "loading") return <div>Loading...</div>;
  if (!session) return <div>You must be signed in to view your profile.</div>;

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <div className="mb-2">Name: {session.user.name}</div>
      <div className="mb-2">Email: {session.user.email}</div>
    </div>
  );
} 