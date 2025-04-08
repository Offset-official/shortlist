// app/page.tsx
"use client";

import React from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function HomePage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">You are not signed in</h1>
        <Link href="/login" className="text-blue-500 underline">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-6">Welcome, {session.user?.name}</h1>
      <p className="text-lg mb-2">Email: {session.user?.email}</p>
      {session.user?.image && (
        <img
          src={session.user.image}
          alt="User Profile"
          className="w-32 h-32 rounded-full mb-4"
        />
      )}
      <button
        onClick={() => signOut({ redirect: false })}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
      >
        Sign Out
      </button>
    </div>
  );
}
