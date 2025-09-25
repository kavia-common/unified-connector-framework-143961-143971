import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Unified Connector",
  description: "Unified Connector Frontend",
};

// PUBLIC_INTERFACE
export default function RootLayout({
  children,
}: {
  /** React children rendered inside the app shell */
  children: React.ReactNode;
}) {
  /**
   * App shell layout:
   * - Top navigation with brand and links
   * - Main content renders below
   * - Ocean Professional palette via Tailwind utilities and CSS vars
   */
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen">
        <header className="border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-2" aria-label="Unified Connector Home">
              <div className="h-6 w-6 rounded-md" style={{ background: "var(--ocean-primary)" }} />
              <span className="text-sm font-semibold text-gray-900">Unified Connector</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/" className="text-gray-700 hover:text-gray-900">Home</Link>
              <Link href="/dashboard" className="text-gray-700 hover:text-gray-900">Dashboard</Link>
              <Link href="/wizard" className="text-gray-700 hover:text-gray-900">Wizard</Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
