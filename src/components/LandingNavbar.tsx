"use client"

import Logo from "@/components/svgs/logo"
import LogoText from "@/components/svgs/logo_text"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import LinkButton from "@/components/link-button"
import { useSession, signOut } from "next-auth/react"
import Image from "next/image"
import toast from "react-hot-toast"
import { useState } from "react"

// Hamburger icon for mobile
function HamburgerIcon({ open, ...props }: { open: boolean } & React.HTMLProps<HTMLButtonElement>) {
  return (
    <button
      {...props}
      type="button"
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

    return(
        <header className="border-b fixed w-full top-0 z-50 bg-background/70">
        <div className="flex h-16 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="w-[35px] h-[35px] fill-primary" />
            <LogoText className="w-[100px] h-[50px] fill-foreground" />
          </Link>
          {/* Hamburger for mobile */}
          <div className="md:hidden">
            <HamburgerIcon open={menuOpen} onClick={() => setMenuOpen(v => !v)} />
          </div>
          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-4">
            {!session ? (
              <>
                <LinkButton
                  href="/onboarding?type=recruiter"
                  text="Join as Recruiter"
                  className="border-secondary  hover:bg-secondary/50 text-secondary bg-secondary/10 hover:text-foreground" />
                <LinkButton
                  href="/onboarding?type=candidate"
                  text="Join as Candidate"
                  className="border-primary hover:bg-primary/50 text-primary bg-primary/10 hover:text-foreground" />
                <LinkButton href="/login" text="login" />
              </>
            ) : (
              <>
                <div className="flex items-center mr-4">
                  <span className="mr-2">Hi, {session.user?.name}</span>
                  {session.user?.image && (
                    <Image
                      src={session.user.image || "./assets/interview1.png"}
                      alt="Profile"
                      width={32}
                      height={32}
                      className="rounded-full" />
                  )}
                </div>
                <LinkButton href="/dashboard" text="Go to Dashboard" className="" />
                <Button
                  variant="ghost"
                  onClick={async () => {
                    const mod = await import('next-auth/react');
                    await mod.signOut({ redirect: true, callbackUrl: "/login" });
                    // toast.success("Signed out successfully!");
                  }}
                  className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                >
                  Sign Out
                </Button>
              </>
            )}
          </div>
        </div>
        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="fixed inset-0 z-50 bg-background/95 flex flex-col items-center justify-center md:hidden animate-in fade-in slide-in-from-top-2">
            <div className="flex flex-col gap-6 w-full max-w-xs items-center">
              {!session ? (
                <>
                  <LinkButton
                    href="/onboarding?type=recruiter"
                    text="Join as Recruiter"
                    className="border-secondary hover:bg-secondary/50 text-secondary bg-secondary/10 hover:text-foreground w-full justify-center text-lg py-3" />
                  <LinkButton
                    href="/onboarding?type=candidate"
                    text="Join as Candidate"
                    className="border-primary hover:bg-primary/50 text-primary bg-primary/10 hover:text-foreground w-full justify-center text-lg py-3" />
                  <LinkButton href="/login" text="login" className="w-full justify-center text-lg py-3" />
                </>
              ) : (
                <>
                  <div className="flex flex-col items-center mb-2">
                    <span className="mb-2 text-lg">Hi, {session.user?.name}</span>
                    {session.user?.image && (
                      <Image
                        src={session.user.image || "./assets/interview1.png"}
                        alt="Profile"
                        width={48}
                        height={48}
                        className="rounded-full mb-2"
                      />
                    )}
                  </div>
                  <LinkButton href="/dashboard" text="Go to Dashboard" className="w-full justify-center text-lg py-3 text-foreground" />
                  <Button
                    variant="ghost"
                    onClick={async () => {
                      const mod = await import('next-auth/react');
                      await mod.signOut({ redirect: true, callbackUrl: "/login" });
                      // toast.success("Signed out successfully!");
                    }}
                    className="text-destructive hover:text-destructive/90 hover:bg-destructive/10 w-full justify-center text-lg py-3"
                  >
                    Sign Out
                  </Button>
                </>
              )}
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
    )
}

export default Navbar