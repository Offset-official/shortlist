import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Providers } from "./providers";
import type { Metadata, Viewport } from "next";
import { ModeToggle } from "@/components/mode-toggle"
import { Toaster } from "react-hot-toast";

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
  themeColor: "#FFFFFF",
};
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased transition-all duration-75 `}>
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
              position="top-right"
              toastOptions={{
                style: {
                  background: 'rgba(30,30,30,0.95)',
                  color: '#fff',
                  borderRadius: '6px',
                  fontSize: '0.97rem',
                  boxShadow: '0 2px 12px 0 rgba(0,0,0,0.10)',
                  border: 'none',
                  padding: '12px 18px',
                  minWidth: '180px',
                  maxWidth: '320px',
                },
                success: {
                  style: {
                    background: 'rgba(34,197,94,0.95)',
                    color: '#fff',
                  },
                  iconTheme: {
                    primary: '#22c55e',
                    secondary: '#fff',
                  },
                },
                error: {
                  style: {
                    background: 'rgba(239,68,68,0.95)',
                    color: '#fff',
                  },
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
