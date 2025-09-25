import type { Metadata } from "next";
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
   * - A light top bar with fixed height (64px) to align with wizard min-height calc.
   * - Main content renders below.
   * - Uses Ocean Professional palette via Tailwind utility classes.
   */
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-gray-50 text-gray-900">
        <div className="w-full border-b bg-white">
          <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
            <div className="font-semibold text-gray-900">Unified Connector</div>
            <div className="text-sm text-gray-500">Ocean Professional</div>
          </div>
        </div>
        {children}
      </body>
    </html>
  );
}
