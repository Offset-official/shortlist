import { Ghost } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-16">
      <div className="flex items-center gap-3 mb-4">
        <Ghost className="h-10 w-10 text-destructive animate-bounce" />
        <h2 className="text-4xl font-bold text-foreground">Page Not Found</h2>
      </div>
      <p className="text-lg text-muted-foreground max-w-xl text-center mb-6">
        Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <a
        href="/"
        className="px-6 py-2 rounded-md bg-primary text-primary-foreground font-semibold shadow hover:bg-primary/80 transition-colors"
      >
        Return Home
      </a>
    </div>
  );
}