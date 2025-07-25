"use client";
import { useSession, signIn, signOut } from "next-auth/react";

export default function SessionHeader() {
  const { data: session, status } = useSession();
  return (
    <header className="flex justify-end items-center p-4 gap-4 h-16">
      {status === "loading" ? null : session?.user ? (
        <div className="flex items-center gap-4">
          <span className="font-medium">{session.user.name || session.user.email}</span>
          <button
            className="bg-red-600 text-white rounded px-4 py-2 hover:bg-red-700"
            onClick={() => signOut()}
          >
            Sign out
          </button>
        </div>
      ) : (
        <button
          className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700"
          onClick={() => signIn()}
        >
          Sign in
        </button>
      )}
    </header>
  );
} 