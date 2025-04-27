"use client"
import Logo from "@/components/svgs/logo"
import LogoText from "@/components/svgs/logo_text"
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Briefcase,
  Calendar,
  ChevronDown,
  LogOut,
  MessageSquare,
  Search,
  Settings,
  User,
} from "lucide-react"
import {Button} from "@/components/ui/button"
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { useState, useRef, useEffect } from "react";

// Add hamburger icon
function HamburgerIcon({ open, ...props }: { open: boolean } & React.HTMLProps<HTMLButtonElement>) {
  return (
    <button
      {...props}
      type="button" // Explicitly set the type
      aria-label="Toggle menu"
      className={`md:hidden p-2 rounded ${open ? "bg-accent" : ""}`}
    >
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
        {open ? (
          <g>
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="6" y1="18" x2="18" y2="6" />
          </g>
        ) : (
          <g>
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </g>
        )}
      </svg>
    </button>
  );
}

// Custom Dropdown component
function CustomDropdown({ label, children }: { label: React.ReactNode, children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="flex items-center gap-1 px-2 py-1 rounded font-medium hover:bg-accent transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        {label}
      </button>
      {open && (
        <div
          className="absolute left-0 mt-2 min-w-[180px] bg-card rounded-md z-50 py-1 transition-all"
          style={{
            border: "1px solid var(--border)",
            boxShadow: "0 2px 8px 0 rgba(0,0,0,0.03)",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

const Navbar = () => {
    const { data: session } = useSession()
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header className="border-b sticky top-0 z-50 bg-card px-5">
            <div className="flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                <Link href="/dashboard" className="flex items-center gap-2">
            <Logo className="fill-primary w-[35px] h-[35px]" />
            <LogoText className="w-[100px] h-[50px] fill-foreground" />
          </Link>
                </div>

                {/* Hamburger for mobile */}
                <div className="flex md:hidden">
                  <HamburgerIcon open={menuOpen} onClick={() => setMenuOpen(v => !v)} />
                </div>

                {/* Desktop nav */}
                <div className="items-center gap-4 hidden md:flex">
                    {/* Main navigation links */}
                    <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors px-2 py-1 rounded">
                        Dashboard
                    </Link>
                    {/* Preparation Dropdown (custom) */}
                    <CustomDropdown
                      label={
                        <>
                          Preparation <ChevronDown className="h-4 w-4 opacity-60" />
                        </>
                      }
                    >
                      <Link
                        href="/dsa"
                        className="flex items-center w-full px-4 py-2 text-sm rounded transition-colors
                          hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"
                      >
                        <Briefcase className="mr-2 h-4 w-4" />
                        DSA Practice
                      </Link>
                      <Link
                        href="/mock-interview"
                        className="flex items-center w-full px-4 py-2 text-sm rounded transition-colors
                          hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        Mock Interview
                      </Link>
                      <Link
                        href="/roadmaps"
                        className="flex items-center w-full px-4 py-2 text-sm rounded transition-colors
                          hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"
                      >
                        <User className="mr-2 h-4 w-4" />
                        Roadmaps
                      </Link>
                    </CustomDropdown>
                    {/* Repeat CustomDropdown for Jobs and Profile as needed */}
                    <CustomDropdown
                      label={
                        <>
                          Jobs <ChevronDown className="h-4 w-4 opacity-60" />
                        </>
                      }
                    >
                      <Link
                        href="/jobs"
                        className="flex items-center w-full px-4 py-2 text-sm rounded transition-colors
                          hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"
                      >
                        <Briefcase className="mr-2 h-4 w-4" />
                        Job Listings
                      </Link>
                      <Link
                        href="/applications"
                        className="flex items-center w-full px-4 py-2 text-sm rounded transition-colors
                          hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"
                      >
                        <User className="mr-2 h-4 w-4" />
                        My Applications
                      </Link>
                      <Link
                        href="/interviews"
                        className="flex items-center w-full px-4 py-2 text-sm rounded transition-colors
                          hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        Interviews
                      </Link>
                    </CustomDropdown>

                    <ModeToggle />
                    <CustomDropdown
                      label={
                        <>
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || "User"} />
                            <AvatarFallback>{session?.user?.name?.charAt(0) || "U"}</AvatarFallback>
                          </Avatar>
                          <span className="hidden md:inline-flex">{session?.user?.name || "User"}</span>
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </>
                      }
                    >
                      <Link
                        href="/profile"
                        className="flex items-center w-full px-4 py-2 text-sm rounded transition-colors
                          hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"
                      >
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center w-full px-4 py-2 text-sm rounded transition-colors
                          hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                      <button
                        onClick={async () => {
                          const mod = await import('next-auth/react');
                          await mod.signOut({ redirect: true, callbackUrl: "/login" });
                          toast.success("Signed out successfully!"); // Optionally remove this line to avoid showing toast after redirect
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-destructive rounded transition-colors
                          hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </button>
                    </CustomDropdown>
                </div>
            </div>

            {/* Mobile fullscreen dropdown menu */}
            {menuOpen && (
              <div className="fixed inset-0 z-50 bg-card/95 flex flex-col items-center justify-center md:hidden">
                <div className="flex flex-col gap-6 w-full max-w-xs items-center">
                  <div className="w-full mb-2">
                    <div className="relative w-full">
                      <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                          type="search"
                          placeholder="Search jobs, companies, skills..."
                          className="w-full rounded-md border border-input bg-background py-2 pl-8 pr-4 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>
                  </div>
                  <Button variant="ghost" className="justify-center w-full text-lg py-3" size="sm">
                    <Calendar className="h-5 w-5 mr-2" /> Calendar
                  </Button>
                  <Button variant="ghost" className="justify-center w-full text-lg py-3" size="sm">
                    <MessageSquare className="h-5 w-5 mr-2" /> Messages
                  </Button>
                  <Button variant="ghost" className="justify-center w-full text-lg py-3" size="sm">
                    <Bell className="h-5 w-5 mr-2" /> Notifications
                  </Button>
                  <div className="w-full flex justify-center">
                    <ModeToggle />
                  </div>
                  <CustomDropdown
                    label={
                      <>
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || "User"} />
                          <AvatarFallback>{session?.user?.name?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <span>{session?.user?.name || "User"}</span>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </>
                    }
                  >
                    <Link
                      href="/profile"
                      className="flex items-center w-full px-4 py-2 text-sm rounded transition-colors
                        hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center w-full px-4 py-2 text-sm rounded transition-colors
                        hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                    <button
                      onClick={async () => {
                        const mod = await import('next-auth/react');
                        await mod.signOut({ redirect: true, callbackUrl: "/login" });
                        // toast.success("Signed out successfully!"); // Optionally remove this line to avoid showing toast after redirect
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-destructive rounded transition-colors
                        hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </button>
                  </CustomDropdown>
                </div>
                {/* Close button in top-right */}
                <button
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close menu"
                  className="absolute top-4 right-4 p-2 rounded bg-muted hover:bg-muted/70"
                >
                  <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="6" y1="6" x2="22" y2="22" />
                    <line x1="6" y1="22" x2="22" y2="6" />
                  </svg>
                </button>
              </div>
            )}
        </header>
    );
}

export default Navbar;

function Bell(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </svg>
    )
  }