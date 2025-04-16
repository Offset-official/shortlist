import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Github, Twitter, Instagram, Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t py-6 md:py-10">
      <div className="container px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Column 1: Logo and Description */}
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-2 mb-4">
              <Image
                src="/assets/interview1.png?height=32&width=32"
                alt="Shortlist Logo"
                width={32}
                height={32}
                className="rounded"
              />
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
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
            </div>
          </div>

          {/* Column 3: Contact Information */}
          <div className="flex flex-col">
            <h3 className="font-medium text-sm mb-4">Contact</h3>
            <div className="flex flex-col space-y-3">
              <Link
                href="mailto:shortlist@example.com"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              >
                <Mail size={16} />
                <span>shortlist@example.com</span>
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
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="GitHub">
              <Github size={18} />
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Twitter">
              <Twitter size={18} />
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Instagram">
              <Instagram size={18} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}