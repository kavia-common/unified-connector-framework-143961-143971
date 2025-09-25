'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button, Card, Spinner, SectionHeader, ErrorBanner, Badge } from '../../components/ui';
import { theme } from '../../components/ui/theme';
import { listConnections, revokeConnection, validateConnection, type ConnectionSummary } from '../../lib/api/connections';

/**
 * PUBLIC_INTERFACE
 * DashboardPage renders the connections dashboard.
 * - Fetches connections dynamically from the backend
 * - Displays responsive grid of connection cards
 * - Provides real-time loading, error, and empty states
 * - Exposes actions: validate, revoke, view resources
 */
export default function DashboardPage() {
  const [data, setData] = useState<ConnectionSummary[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<Record<string, boolean>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listConnections();
      setData(res || []);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load connections. Please try again.';
      setError(msg);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const isEmpty = useMemo(() => !loading && !error && (data?.length ?? 0) === 0, [loading, error, data]);

  const onValidate = async (id: string) => {
    setBusy((b) => ({ ...b, [id]: true }));
    try {
      await validateConnection(id);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Validation failed. Please try again.');
    } finally {
      setBusy((b) => ({ ...b, [id]: false }));
    }
  };

  const onRevoke = async (id: string) => {
    if (!confirm('Revoke this connection? This will remove access.')) return;
    setBusy((b) => ({ ...b, [id]: true }));
    try {
      await revokeConnection(id);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Revoke failed. Please try again.');
    } finally {
      setBusy((b) => ({ ...b, [id]: false }));
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <SectionHeader
        title="Connections"
        subtitle="Manage your unified connections. Data loads live from the backend."
        cta={
          <Link href="/wizard">
            <Button variant="primary">Add connection</Button>
          </Link>
        }
      />

      {error && <ErrorBanner message={error} onRetry={load} />}

      {loading && (
        <Card>
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <Spinner />
              <p className="text-sm text-gray-600">Loading connections...</p>
            </div>
          </div>
        </Card>
      )}

      {isEmpty && (
        <Card>
          <div className="flex flex-col items-center justify-center py-12">
            <div
              className="h-16 w-16 rounded-xl grid place-content-center"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.gradientFrom}, ${theme.colors.gradientTo})`,
                boxShadow: theme.shadow.md,
              }}
            >
              <span className="text-3xl">🔗</span>
            </div>
            <h3 className="mt-4 text-base font-semibold text-gray-900">No connections yet</h3>
            <p className="text-sm text-gray-500 mt-1">Use the wizard to add and authorize a connector.</p>
            <Link href="/wizard" className="mt-4">
              <Button variant="primary">Open Wizard</Button>
            </Link>
          </div>
        </Card>
      )}

      {!loading && !error && (data?.length ?? 0) > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {data!.map((conn) => {
            const status = (conn.status || 'unknown').toLowerCase();
            const statusStyle =
              status === 'connected'
                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                : status === 'pending'
                ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                : status === 'revoked' || status === 'disconnected'
                ? 'bg-red-50 text-red-700 ring-1 ring-red-200'
                : 'bg-gray-50 text-gray-700 ring-1 ring-gray-200';

            return (
              <Card key={conn.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {conn.connector?.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={conn.connector.logoUrl}
                        alt={`${conn.connector?.name || 'Connector'} logo`}
                        className="h-10 w-10 rounded-lg object-cover ring-1 ring-gray-200"
                      />
                    ) : (
                      <div
                        className="h-10 w-10 rounded-lg grid place-content-center"
                        style={{
                          background: `linear-gradient(135deg, ${theme.colors.gradientFrom}, ${theme.colors.gradientTo})`,
                        }}
                      >
                        <span className="text-lg">🔌</span>
                      </div>
                    )}
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">
                        {conn.connector?.name || conn.name || 'Unnamed Connector'}
                      </h3>
                      <div className="mt-1 flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${statusStyle}`}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                        {conn.environment ? <Badge>{conn.environment}</Badge> : null}
                      </div>
                      {conn.createdAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          Created {new Date(conn.createdAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      disabled={!!busy[conn.id]}
                      onClick={() => onValidate(conn.id)}
                    >
                      {busy[conn.id] ? <Spinner size="sm" /> : 'Validate'}
                    </Button>
                    <Button
                      variant="danger"
                      disabled={!!busy[conn.id]}
                      onClick={() => onRevoke(conn.id)}
                    >
                      {busy[conn.id] ? <Spinner size="sm" /> : 'Revoke'}
                    </Button>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                    {conn.scopes?.length ? (
                      conn.scopes.slice(0, 4).map((s) => (
                        <Badge key={s} className="bg-blue-50 text-blue-700 ring-1 ring-blue-200">
                          {s}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-gray-400">No scopes</span>
                    )}
                    {conn.scopes && conn.scopes.length > 4 && (
                      <span className="text-gray-400">+{conn.scopes.length - 4} more</span>
                    )}
                  </div>

                  <Link href={`/connections/${encodeURIComponent(conn.id)}`} className="text-blue-600 text-sm hover:underline">
                    View resources →
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}
