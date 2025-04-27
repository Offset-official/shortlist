import React from "react";
import Link from "next/link";
import Logo from "@/components/svgs/logo";
import { Github, Instagram, Mail, Phone, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-background border-t py-6 md:py-10">
      <div className=" px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-2 mb-4">
              <Logo className="h-8 w-8 fill-foreground" />
              <span className="font-semibold">Shortlist</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              Helping companies find the best talent and candidates land their dream jobs.
            </p>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="flex flex-col">
            <h3 className="font-medium text-sm mb-4">Links</h3>
            <div className="flex flex-col space-y-3">
              <Link href="/about_us" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                About
              </Link>
              <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
            </div>
          </div>

          {/* Column 3: Contact Information */}
          <div className="flex flex-col">
            <h3 className="font-medium text-sm mb-4">Contact</h3>
            <div className="flex flex-col space-y-3">
              <Link
                href="mailto:shortlist.notifs@gmail.com"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              >
                <Mail size={16} />
                <span>shortlist.notifs@gmail.com</span>
              </Link>
              <Link
                href="tel:+917014206208"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              >
                <Phone size={16} />
                <span>+91 7014206208</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section with Socials and Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-6 border-t border-muted px-10">
          {/* Copyright */}
          <p className="text-xs text-muted-foreground order-2 md:order-1">
            © {new Date().getFullYear()} Shortlist. All rights reserved.
          </p>

          {/* Social Icons */}
          <div className="flex items-center gap-4 order-1 md:order-2">
            <Link href="https://github.com/Offset-official/shortlist" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="GitHub">
              <Github size={18} />
            </Link>
            <Link href="https://youtube.com" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Youtube">
              <Youtube size={18} />
            </Link>
            <Link href="https://www.instagram.com/offset_official__/" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Instagram">
              <Instagram size={18} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}