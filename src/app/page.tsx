"use client";

import { Button } from "@/components/ui/button";
import Link from 'next/link'
import { useRouter } from "next/navigation";
const Home=()=>{

  const router = useRouter();

  function handleButtonClick() {
    // Save your system instruction in sessionStorage (or localStorage)
    sessionStorage.setItem("systemInstruction", "you are tom cruise");
    // Then navigate cleanly to /chat (no query params)
    router.push("/chat");
  }

  return (
    <div className="min-h-screen p-8 bg-background text-foreground">
      <h1 className="text-3xl font-bold mb-6">ShortList</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            className="p-4 rounded-lg border border-border shadow-md bg-card"
          >
                <Link 
      href="/color_check" 
      className="bg-accent text-white hover:bg-accent-foreground px-4 py-2 rounded inline-block"
    >
      Color Check
    </Link>
            <p className="font-semibold"></p>
            <p className="text-sm text-muted-foreground"></p>
          </div>
          <Button onClick={handleButtonClick}>
      Go to Chat as Tom Cruise
    </Button>
      </div>
    </div>
  );
}

export default Home;