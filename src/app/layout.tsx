import { Noto_Sans, Noto_Sans_Mono } from 'next/font/google'
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Providers } from "./providers";
import type { Metadata, Viewport } from "next";
import { ModeToggle } from "@/components/mode-toggle"
import { Toaster } from "react-hot-toast";
import { CheckCircle, XCircle, Info } from 'lucide-react';

const APP_NAME = "Shortlist";
const APP_DEFAULT_TITLE = "Shortlist - Connecting Talent with Opportunities";
const APP_TITLE_TEMPLATE = "%s - Shortlist App";
const APP_DESCRIPTION = "A platform for recruiters and candidates to connect and grow";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
    // startUpImage: [],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#0B0C0E",
};
 
const noto = Noto_Sans({
  subsets: ['latin'],
  display: 'swap',
})

const noto_mono = Noto_Sans_Mono({
  subsets: ['latin'],
  display: 'swap',
})


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
      </head>
      <body className={`${noto.className} antialiased transition-all duration-75  bg-background text-foreground`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            {children}
            <ModeToggle />
            <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: 'var(--color-card)',
          color: 'var(--color-card-foreground)',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          boxShadow: '0 2px 8px 0 rgba(0,0,0,0.05)',
          border: '1px solid var(--color-border)',
          padding: '10px 14px',
          minWidth: '160px',
          maxWidth: '300px',
        },
        success: {
          icon: <CheckCircle className="text-tertiary" size={18} />,
        },
        error: {
          icon: <XCircle className="text-destructive" size={18} />,
        },
        custom: {
          icon: <Info className="text-secondary" size={18} />,
        },
      }}
    />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
