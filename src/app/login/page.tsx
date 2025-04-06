// File: app/login/page.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false, // handle manually
    });

    if (result?.error) {
      alert(result.error);
      return;
    }

    // If success, redirect
    router.push("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-[400px] p-6 shadow-lg flex flex-col gap-4">
        <h2 className="text-xl font-bold text-center">Login</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block mb-1 font-medium" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className="border p-2 w-full rounded"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              className="border p-2 w-full rounded"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="bg-primary text-white rounded p-2 mt-2 font-semibold"
          >
            Sign In
          </button>
        </form>
      </Card>
    </div>
  );
}
