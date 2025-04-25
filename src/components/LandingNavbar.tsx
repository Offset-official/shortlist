"use client"

import Logo from "@/components/svgs/logo"
import LogoText from "@/components/svgs/logo_text"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import LinkButton from "@/components/link-button"
import { useSession, signOut } from "next-auth/react"
import Image from "next/image"
import toast from "react-hot-toast"
const Navbar = () => {
    const { data: session } = useSession()
    return(
        <header className="border-b fixed w-full top-0 z-50 bg-background/70">
        <div className=" flex h-16 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="w-[50px] h-[50px] fill-foreground" />
            <LogoText className="w-[100px] h-[50px] fill-foreground" />
          </Link>
          <div className="flex items-center gap-4">
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
                    await signOut({ redirect: false })
                    toast.success("Signed out successfully!")
                  }}
                  className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                >
                  Sign Out
                </Button>
              </>
            )}
          </div>
        </div>
      </header>
    )
}

    export default Navbar