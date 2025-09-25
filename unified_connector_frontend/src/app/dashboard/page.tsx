"use client";

import useSWR, { mutate } from "swr";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

// Reuse existing fetcher style from lib/api where possible
const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Failed to fetch ${url}: ${res.status}`);
  }
  return res.json();
};

// Types for connections and connectors
type ConnectorInfo = {
  key: string;
  name: string;
  description?: string;
  icon?: string; // url
  category?: string;
};

type Connection = {
  id: string;
  connectorKey: string;
  displayName?: string;
  createdAt?: string;
  updatedAt?: string;
  status: "connected" | "invalid" | "revoked" | "pending";
  lastValidatedAt?: string | null;
  metadata?: Record<string, unknown>;
};

type ConnectionWithConnector = Connection & { connector?: ConnectorInfo };

// Color palette (Ocean Professional)
const colors = {
  primary: "#2563EB", // blue-600
  secondary: "#F59E0B", // amber-500
  success: "#10B981", // emerald-500 (use for healthy states)
  warning: "#F59E0B", // amber-500
  error: "#EF4444", // red-500
  text: "#111827",
};

// Status pill component
function StatusPill({ status }: { status: Connection["status"] }) {
  const { bg, text, label } = useMemo(() => {
    switch (status) {
      case "connected":
        return { bg: "bg-emerald-50 text-emerald-700 ring-emerald-600/20", text: colors.success, label: "Connected" };
      case "pending":
        return { bg: "bg-blue-50 text-blue-700 ring-blue-600/20", text: colors.primary, label: "Pending" };
      case "invalid":
        return { bg: "bg-amber-50 text-amber-700 ring-amber-600/20", text: colors.warning, label: "Needs Validation" };
      case "revoked":
      default:
        return { bg: "bg-red-50 text-red-700 ring-red-600/20", text: colors.error, label: "Revoked" };
    }
  }, [status]);

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${bg}`}
      style={{ color: text }}
      aria-label={`status-${status}`}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: text }} />
      {label}
    </span>
  );
}

// Action buttons
function ActionButtons({
  connection,
  onValidate,
  onRevoke,
  validating,
  revoking,
}: {
  connection: ConnectionWithConnector;
  onValidate: (id: string) => Promise<void>;
  onRevoke: (id: string) => Promise<void>;
  validating: boolean;
  revoking: boolean;
}) {
  const canValidate = connection.status === "connected" || connection.status === "invalid" || connection.status === "pending";
  const canRevoke = connection.status !== "revoked";

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onValidate(connection.id)}
        disabled={!canValidate || validating}
        className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-white transition-colors ${
          canValidate && !validating ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-300 cursor-not-allowed"
        }`}
      >
        {validating ? "Validating..." : "Validate"}
      </button>
      <button
        onClick={() => onRevoke(connection.id)}
        disabled={!canRevoke || revoking}
        className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
          canRevoke && !revoking
            ? "text-red-700 bg-red-50 hover:bg-red-100 ring-1 ring-inset ring-red-200"
            : "text-red-400 bg-red-50 cursor-not-allowed ring-1 ring-inset ring-red-100"
        }`}
      >
        {revoking ? "Revoking..." : "Revoke"}
      </button>
    </div>
  );
}

import Image from "next/image";

function ConnectorAvatar({ connector }: { connector?: ConnectorInfo }) {
  if (connector?.icon) {
    return (
      <div className="h-10 w-10 overflow-hidden rounded-md ring-1 ring-gray-200 bg-white">
        <Image
          src={connector.icon}
          alt={`${connector.name} icon`}
          width={40}
          height={40}
          className="h-10 w-10 object-contain"
        />
      </div>
    );
  }
  const initials = connector?.name
    ? connector.name
        .split(" ")
        .map((s) => s[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "UC";
  return (
    <div className="h-10 w-10 rounded-md flex items-center justify-center text-sm font-semibold ring-1 ring-gray-200"
      style={{ background: "linear-gradient(to bottom right, rgba(59,130,246,0.1), #f9fafb)" }}>
      {initials}
    </div>
  );
}

// Card component for a connection
function ConnectionCard({
  data,
  onValidate,
  onRevoke,
  validatingId,
  revokingId,
}: {
  data: ConnectionWithConnector;
  onValidate: (id: string) => Promise<void>;
  onRevoke: (id: string) => Promise<void>;
  validatingId: string | null;
  revokingId: string | null;
}) {
  const validating = validatingId === data.id;
  const revoking = revokingId === data.id;

  return (
    <li className="group rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200 transition hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <ConnectorAvatar connector={data.connector} />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-gray-900">
                {data.displayName || data.connector?.name || data.connectorKey}
              </h3>
              <StatusPill status={data.status} />
            </div>
            <p className="mt-1 text-sm text-gray-600">
              {data.connector?.description || "Managed connection to external service."}
            </p>
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
              <span>Connector: {data.connectorKey}</span>
              {data.updatedAt && <span>Updated: {new Date(data.updatedAt).toLocaleString()}</span>}
              {data.lastValidatedAt && <span>Last validated: {new Date(data.lastValidatedAt).toLocaleString()}</span>}
            </div>
          </div>
        </div>
        <ActionButtons
          connection={data}
          onValidate={onValidate}
          onRevoke={onRevoke}
          validating={validating}
          revoking={revoking}
        />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-xs text-gray-500">
          ID: <code className="rounded bg-gray-50 px-1 py-0.5 ring-1 ring-gray-200">{data.id}</code>
        </div>
        <Link
          href={`/wizard?connector=${encodeURIComponent(data.connectorKey)}`}
          className="text-sm font-medium text-blue-700 hover:text-blue-800"
        >
          Configure
        </Link>
      </div>
    </li>
  );
}

// PUBLIC_INTERFACE
export default function DashboardPage() {
  /**
   * Displays a dashboard of all established connections, with status indicators and actions.
   * - Fetches connectors and connections.
   * - Allows validate and revoke actions.
   * - Uses SWR for real-time/reactive updates via revalidation and focus/reconnect events.
   */
  const [validatingId, setValidatingId] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const { data: connectors, error: connectorsError } = useSWR<ConnectorInfo[]>("/api/connectors", fetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  });
  const {
    data: connections,
    isLoading,
    error: connectionsError,
  } = useSWR<Connection[]>("/api/connections", fetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    refreshInterval: 15000, // gentle polling for freshness
  });

  const connectionsWithConnector = useMemo<ConnectionWithConnector[] | undefined>(() => {
    if (!connections) return undefined;
    const byKey: Record<string, ConnectorInfo> = {};
    (connectors || []).forEach((c) => (byKey[c.key] = c));
    return connections.map((conn) => ({ ...conn, connector: byKey[conn.connectorKey] }));
  }, [connections, connectors]);

  const onValidate = useCallback(async (id: string) => {
    try {
      setValidatingId(id);
      const res = await fetch(`/api/connections/${encodeURIComponent(id)}/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || `Failed to validate connection ${id}`);
      }
      // Optimistically revalidate list
      await mutate("/api/connections");
    } catch (e) {
      console.error(e);
      alert((e as Error).message || "Validation failed");
    } finally {
      setValidatingId(null);
    }
  }, []);

  const onRevoke = useCallback(async (id: string) => {
    if (!confirm("Are you sure you want to revoke this connection?")) return;
    try {
      setRevokingId(id);
      const res = await fetch(`/api/connections/${encodeURIComponent(id)}/revoke`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || `Failed to revoke connection ${id}`);
      }
      await mutate("/api/connections");
    } catch (e) {
      console.error(e);
      alert((e as Error).message || "Revoke failed");
    } finally {
      setRevokingId(null);
    }
  }, []);

  return (
    <main className="min-h-screen"
      style={{ background: "linear-gradient(to bottom right, rgba(59,130,246,0.08), #f9fafb)" }}
    >
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Connections Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            View and manage all established connections. Validate health, revoke access, and configure connectors.
          </p>
        </header>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs text-gray-600">Live updates enabled</span>
          </div>
          <Link
            href="/wizard"
            className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            + New Connection
          </Link>
        </div>

        {/* Error states */}
        {connectorsError && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">
            Failed to load connectors
          </div>
        )}
        {connectionsError && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">
            Failed to load connections
          </div>
        )}

        {/* Loading */}
        {isLoading && !connectionsWithConnector && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-xl bg-white/60 ring-1 ring-gray-200" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && connectionsWithConnector && connectionsWithConnector.length === 0 && (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">No connections yet</h3>
            <p className="mt-1 text-sm text-gray-600">
              Get started by creating your first connection using the setup wizard.
            </p>
            <div className="mt-4">
              <Link
                href="/wizard"
                className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Open Wizard
              </Link>
            </div>
          </div>
        )}

        {/* List */}
        {connectionsWithConnector && connectionsWithConnector.length > 0 && (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {connectionsWithConnector.map((c) => (
              <ConnectionCard
                key={c.id}
                data={c}
                onValidate={onValidate}
                onRevoke={onRevoke}
                validatingId={validatingId}
                revokingId={revokingId}
              />
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
