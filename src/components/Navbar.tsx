"use client"
import Logo from "@/components/svgs/logo"
import LogoText from "@/components/svgs/logo_text"
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { useState } from "react";

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

const Navbar = () => {
    const { data: session } = useSession()
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header className="border-b sticky top-0 z-50 bg-card px-5">
            <div className="flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                <Link href="/dashboard" className="flex items-center gap-2">
            <Logo className="w-[50px] h-[50px] fill-foreground" />
            <LogoText className="w-[100px] h-[50px] fill-foreground" />
          </Link>
                </div>

                {/* Hamburger for mobile */}
                <div className="flex md:hidden">
                  <HamburgerIcon open={menuOpen} onClick={() => setMenuOpen(v => !v)} />
                </div>

                {/* Desktop search bar */}
                <div className="flex-1 px-8 hidden md:block">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="search"
                            placeholder="Search jobs, companies, skills..."
                            className="w-full rounded-md border border-input bg-background py-2 pl-8 pr-4 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                    </div>
                </div>

                {/* Desktop nav */}
                <div className="items-center gap-4 hidden md:flex">
                    <Button variant="ghost" size="icon">
                        <Calendar className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                        <MessageSquare className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                        <Bell className="h-5 w-5" />
                    </Button>
                    <ModeToggle />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-8 flex items-center gap-2 rounded-full">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || "User"} />
                                    <AvatarFallback>{session?.user?.name?.charAt(0) || "U"}</AvatarFallback>
                                </Avatar>
                                <span className="hidden md:inline-flex">{session?.user?.name || "User"}</span>
                                <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/profile" className="flex items-center w-full">
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Profile</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/settings" className="flex items-center w-full">
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Settings</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={async () => {
                                const mod = await import('next-auth/react');
                                await mod.signOut({ redirect: false });
                                toast.success("Signed out successfully!");
                            }} className="text-destructive focus:text-destructive">
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Mobile fullscreen dropdown menu */}
            {menuOpen && (
              <div className="fixed inset-0 z-50 bg-card/95 flex flex-col items-center justify-center md:hidden animate-in fade-in slide-in-from-top-2">
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 flex items-center gap-2 rounded-full w-full justify-center text-lg py-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || "User"} />
                          <AvatarFallback>{session?.user?.name?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <span>{session?.user?.name || "User"}</span>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="flex items-center w-full">
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/settings" className="flex items-center w-full">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={async () => {
                        const mod = await import('next-auth/react');
                        await mod.signOut({ redirect: false });
                        toast.success("Signed out successfully!");
                      }} className="text-destructive focus:text-destructive">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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