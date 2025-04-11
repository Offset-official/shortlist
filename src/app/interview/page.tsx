'use client';

import { useEffect, useState } from 'react';
import TalkingHeadComponent from '@/components/TalkingAvatar';

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Only render the component on the client side
  if (!isMounted) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-900">
        <h1 className="text-3xl font-bold text-white mb-6">Talking Head Demo</h1>
        <div className="w-full max-w-3xl h-[600px] flex items-center justify-center">
          <p className="text-white text-xl">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-900">
      <h1 className="text-3xl font-bold text-white mb-6">Talking Head Demo</h1>
      
      <div className="w-full max-w-3xl h-[600px] relative overflow-hidden rounded-lg shadow-xl">
        <TalkingHeadComponent />
      </div>
      
      <footer className="mt-8 text-gray-400 text-sm">
        <p>This is a demo of the TalkingHead component.</p>
        <p>Note: You need to set your Google TTS API key in the component.</p>
      </footer>
    </main>
  );
}