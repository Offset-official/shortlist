"use client"
import React from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ComingSoon() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-16">
      <div className="flex items-center gap-3 mb-4">
        <Clock className="h-10 w-10 text-primary animate-pulse" />
        <h1 className="text-4xl font-bold text-foreground">Coming Soon</h1>
      </div>
      <p className="text-lg text-muted-foreground max-w-xl text-center mb-6">
        This feature is under development and will be available soon. Stay tuned!
      </p>
      <Button onClick={() => window.location.href = '/'} className="mt-2">
        Go to Landing Page
      </Button>
    </div>
  );
}
