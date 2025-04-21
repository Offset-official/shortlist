'use client';

import { useEffect, useState } from 'react';
import TalkingHeadComponent from '@/components/TalkingAvatar';
import { toast } from "react-hot-toast";

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Example: Add toast to interview action
  const handleInterviewAction = async () => {
    try {
      // ...existing code...
      toast.success("Interview action successful!");
      // ...existing code...
    } catch (err) {
      toast.error("Interview action failed.");
    }
  };

  // Only render the component on the client side
  if (!isMounted) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-900">
        <h1 className="text-3xl font-bold text-white mb-6">Talking Head Demo</h1>
        <div className="w-[300px] h-[300px] relative overflow-hidden rounded-lg shadow-xl">
          <p className="text-white text-xl">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-[300px] h-[300px] relative overflow-hidden rounded-lg shadow-xl">
        <TalkingHeadComponent text="it'll be fine" gender='man'/>
      </div>
    </main>
  );
}