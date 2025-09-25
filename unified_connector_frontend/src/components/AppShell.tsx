import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from './ui/Button';
import { theme } from './ui/theme';

const NavLink: React.FC<{ href: string; label: string; icon?: React.ReactNode }> = ({ href, label, icon }) => {
  const pathname = usePathname();
  const active = pathname === href || (href !== '/' && pathname.startsWith(href));
  return (
    <Link
      href={href}
      className={[
        'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition',
        active ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100',
      ].join(' ')}
      style={{ transition: theme.transition.base }}
    >
      <span className={['h-5 w-5', active ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'].join(' ')}>{icon}</span>
      <span>{label}</span>
    </Link>
  );
};

/**
 * PUBLIC_INTERFACE
 * AppShell provides a responsive sidebar and topbar with Ocean Professional styling.
 */
export const AppShell: React.FC<React.PropsWithChildren<object>> = ({ children }) => {
  return (
    <div className="min-h-screen" style={{ background: theme.colors.background }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4 pb-24">
        <div className="grid grid-cols-12 gap-6">
          <aside className="col-span-12 lg:col-span-3">
            <div className="rounded-2xl border bg-white/80 backdrop-blur-sm">
              <div className="p-5 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-blue-600/10 ring-1 ring-blue-600/20 flex items-center justify-center text-blue-600 font-semibold">
                      UC
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">Unified Connector</div>
                      <div className="text-xs text-gray-500">Ocean Professional</div>
                    </div>
                  </div>
                </div>
              </div>
              <nav className="p-3 space-y-1">
                <NavLink href="/" label="Overview" />
                <NavLink href="/dashboard" label="Dashboard" />
                <NavLink href="/wizard" label="New Connection" />
                <NavLink href="/connections" label="Connections" />
              </nav>
              <div className="p-4 border-t">
                <Button variant="outline" className="w-full">Upgrade plan</Button>
              </div>
            </div>
          </aside>
          <main className="col-span-12 lg:col-span-9">
            <div
              className="rounded-2xl border bg-white/80 backdrop-blur-sm shadow-md"
              style={{ borderColor: theme.colors.border }}
            >
              <div className="p-6">{children}</div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AppShell;
