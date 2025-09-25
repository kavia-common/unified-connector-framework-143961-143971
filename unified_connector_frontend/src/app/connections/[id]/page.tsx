"use client";

import { useCallback, useState } from "react";
import useSWR, { mutate } from "swr";
import Link from "next/link";
import { notFound, useParams, useRouter, useSearchParams } from "next/navigation";



/**
 * Utilities
 */
import { getApiBaseUrl } from "../../../lib/api/client";
const API_BASE = getApiBaseUrl();

/**
 * Generic fetcher for SWR with unified envelope parsing.
 * Typed to the expected response T to satisfy SWR generics.
 * Use generic arrow function syntax safe in TSX files.
 */
const envelopeFetcher = async <T,>(url: string): Promise<T> => {
  const res = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    credentials: "include",
  });
  const contentType = res.headers.get("content-type") || "";
  const body: unknown = contentType.includes("application/json") ? await res.json() : await res.text();
  if (!res.ok) {
    type ErrShape = { message?: string } | { error?: { message?: string } } | string | null;
    const b = body as ErrShape;
    let message: string | undefined;
    if (typeof b === "string") {
      message = b;
    } else if (b && typeof b === "object") {
      const be = (b as { error?: { message?: string }; message?: string }).error;
      message = (b as { message?: string }).message || be?.message;
    }
    throw new Error(message || `Request failed: ${res.status}`);
  }
  // Backend should wrap with unified envelope; if not, normalize
  const isEnvelope =
    typeof body === "object" &&
    body !== null &&
    ("ok" in (body as Record<string, unknown>) ||
      "data" in (body as Record<string, unknown>) ||
      "error" in (body as Record<string, unknown>));

  if (isEnvelope) {
    const env = body as { ok?: boolean; data?: unknown; error?: { message?: string } };
    if (env.ok === false) throw new Error(env.error?.message || "Request failed");
    return (env.data as T) ?? (null as T);
  }
  return body as T;
};

type Container = {
  id: string;
  name: string;
  key?: string;
  type?: string; // e.g., "project", "space"
  raw?: unknown;
};

type Item = {
  id: string;
  title: string;
  containerId?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  raw?: unknown;
};

type Comment = {
  id: string;
  author?: string;
  body: string;
  createdAt?: string;
  raw?: unknown;
};

type ConnectionDetail = {
  id: string;
  connectorKey: string;
  displayName?: string;
  status: "connected" | "invalid" | "revoked" | "pending";
  metadata?: Record<string, unknown>;
  raw?: unknown;
};

type CreateItemPayload = {
  title: string;
  body?: string;
  containerId?: string | null;
};

type CreateCommentPayload = {
  body: string;
};

/**
 * Helpers to build endpoints that match the backend unified envelope routes.
 * These are based on typical patterns:
 *   GET  /connections/{id}                          -> connection detail
 *   GET  /connections/{id}/containers               -> list containers
 *   GET  /connections/{id}/items?containerId=...&q= -> list items filtered
 *   POST /connections/{id}/items                    -> create item
 *   GET  /connections/{id}/items/{itemId}           -> item detail
 *   GET  /connections/{id}/items/{itemId}/comments  -> list comments
 *   POST /connections/{id}/items/{itemId}/comments  -> add comment
 */
const endpoints = {
  connection: (id: string) => `${API_BASE}/connections/${encodeURIComponent(id)}`,
  containers: (id: string) => `${API_BASE}/connections/${encodeURIComponent(id)}/containers`,
  items: (id: string, containerId?: string | null, q?: string | null) => {
    const usp = new URLSearchParams();
    if (containerId) usp.set("containerId", containerId);
    if (q) usp.set("q", q);
    const qs = usp.toString();
    return `${API_BASE}/connections/${encodeURIComponent(id)}/items${qs ? `?${qs}` : ""}`;
  },
  item: (id: string, itemId: string) =>
    `${API_BASE}/connections/${encodeURIComponent(id)}/items/${encodeURIComponent(itemId)}`,
  comments: (id: string, itemId: string) =>
    `${API_BASE}/connections/${encodeURIComponent(id)}/items/${encodeURIComponent(itemId)}/comments`,
};

/**
 * Tab definitions
 */
type TabKey = "containers" | "items" | "item" | "raw";
const TABS: { key: TabKey; label: string }[] = [
  { key: "containers", label: "Containers" },
  { key: "items", label: "Items" },
  { key: "item", label: "Item Detail" },
  { key: "raw", label: "Raw JSON" },
];

/**
 * Components
 */
function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="mb-4">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
    </header>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200" role="alert">
      {message}
    </div>
  );
}

function LoadingSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 animate-pulse rounded-lg bg-white/60 ring-1 ring-gray-200" />
      ))}
    </div>
  );
}

function TabNav({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (key: TabKey) => void;
}) {
  return (
    <div className="mb-4 flex items-center gap-2 overflow-x-auto rounded-lg bg-white p-1 ring-1 ring-gray-200">
      {TABS.map((t) => {
        const selected = active === t.key;
        return (
          <button
            key={t.key}
            className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              selected ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-50"
            }`}
            onClick={() => onChange(t.key)}
            aria-current={selected ? "page" : undefined}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

function ContainersList({
  connectionId,
}: {
  connectionId: string;
}) {
  const { data, error, isLoading } = useSWR<Container[]>(
    endpoints.containers(connectionId),
    (url: string) => envelopeFetcher<Container[]>(url),
    { revalidateOnFocus: true, revalidateOnReconnect: true }
  );

  return (
    <section aria-label="Containers list">
      <SectionHeader title="Containers" subtitle="Projects or spaces available in this connection." />
      {error && <ErrorBanner message="Failed to load containers" />}
      {isLoading && <LoadingSkeleton rows={4} />}
      {data && data.length === 0 && (
        <div className="rounded-lg bg-white p-6 text-center ring-1 ring-gray-200">
          <p className="text-sm text-gray-600">No containers found for this connection.</p>
        </div>
      )}
      {data && data.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2">
          {data.map((c) => (
            <li key={c.id} className="rounded-lg bg-white p-4 ring-1 ring-gray-200">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">{c.name}</h3>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {c.type || "container"} {c.key ? `• ${c.key}` : ""}
                  </p>
                </div>
                {typeof c.raw !== 'undefined' && (
                  <span className="rounded bg-gray-50 px-2 py-1 text-xs text-gray-600 ring-1 ring-gray-200">
                    raw
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ItemsPanel({
  connectionId,
}: {
  connectionId: string;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedContainer = searchParams.get("containerId");
  const qParam = searchParams.get("q");

  const [search, setSearch] = useState(qParam || "");
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<CreateItemPayload>({ title: "", body: "", containerId: selectedContainer });

  const key = endpoints.items(connectionId, selectedContainer, qParam);
  const { data, error, isLoading } = useSWR<Item[]>(key, (url: string) => envelopeFetcher<Item[]>(url), {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  });

  const onSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const usp = new URLSearchParams(searchParams.toString());
      if (search) usp.set("q", search);
      else usp.delete("q");
      router.push(`?${usp.toString()}`);
    },
    [router, search, searchParams]
  );

  const onCreate = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!form.title.trim()) {
        alert("Title is required");
        return;
      }
      try {
        setCreating(true);
        const res = await fetch(endpoints.items(connectionId, null, null), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            title: form.title,
            body: form.body || undefined,
            containerId: form.containerId || undefined,
          } as CreateItemPayload),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || (json && json.ok === false)) {
          const msg =
            (json?.error?.message as string) ||
            (typeof json === "string" ? json : "") ||
            `Failed to create item (${res.status})`;
          throw new Error(msg);
        }
        // revalidate list
        await mutate(key);
        setForm((prev) => ({ ...prev, title: "", body: "" }));
        alert("Item created.");
      } catch (err) {
        console.error(err);
        alert((err as Error).message || "Create item failed");
      } finally {
        setCreating(false);
      }
    },
    [connectionId, form.body, form.containerId, form.title, key]
  );

  return (
    <section aria-label="Items list">
      <SectionHeader
        title="Items"
        subtitle="Issues, pages or records inside containers. Use search to filter."
      />
      {/* Controls */}
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <form onSubmit={onSearch} className="flex items-center gap-2">
          <input
            type="text"
            aria-label="Search items"
            placeholder="Search items..."
            className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
            aria-label="Run search"
          >
            Search
          </button>
        </form>

        {/* Create item */}
        <form onSubmit={onCreate} className="flex items-center gap-2">
          <input
            type="text"
            aria-label="New item title"
            placeholder="New item title"
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          />
          <button
            type="submit"
            disabled={creating}
            className={`rounded-md px-3 py-2 text-sm font-medium text-white ${
              creating ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
            aria-label="Create item"
          >
            {creating ? "Creating..." : "Create"}
          </button>
        </form>
      </div>

      {error && <ErrorBanner message="Failed to load items" />}
      {isLoading && <LoadingSkeleton rows={4} />}

      {data && data.length === 0 && (
        <div className="rounded-lg bg-white p-6 text-center ring-1 ring-gray-200">
          <p className="text-sm text-gray-600">No items found. Try a different search or create one.</p>
        </div>
      )}

      {data && data.length > 0 && (
        <ul className="divide-y divide-gray-100 rounded-lg bg-white ring-1 ring-gray-200">
          {data.map((it) => (
            <li key={it.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{it.title}</h3>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {it.status || "open"} {it.updatedAt ? `• updated ${new Date(it.updatedAt).toLocaleString()}` : ""}
                  </p>
                </div>
                <ItemOpenButton itemId={it.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ItemOpenButton({ itemId }: { itemId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const usp = new URLSearchParams(searchParams.toString());
  const onOpen = () => {
    usp.set("tab", "item");
    usp.set("itemId", itemId);
    router.push(`?${usp.toString()}`);
  };
  return (
    <button
      onClick={onOpen}
      className="rounded-md bg-white px-3 py-1.5 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-200 hover:bg-blue-50"
      aria-label="Open item detail"
    >
      Open
    </button>
  );
}

function ItemDetail({
  connectionId,
}: {
  connectionId: string;
}) {
  const searchParams = useSearchParams();
  const itemId = searchParams.get("itemId");
  const { data: item, error: itemError, isLoading: itemLoading } = useSWR<Item | null>(
    itemId ? endpoints.item(connectionId, itemId) : null,
    (url: string) => envelopeFetcher<Item | null>(url),
    { revalidateOnFocus: true, revalidateOnReconnect: true }
  );

  const {
    data: comments,
    error: commentsError,
    isLoading: commentsLoading,
  } = useSWR<Comment[] | null>(
    itemId ? endpoints.comments(connectionId, itemId) : null,
    (url: string) => envelopeFetcher<Comment[] | null>(url),
    { revalidateOnFocus: true, revalidateOnReconnect: true }
  );

  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  const onAddComment = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!itemId) return;
      if (!comment.trim()) {
        alert("Comment cannot be empty");
        return;
      }
      try {
        setSaving(true);
        const res = await fetch(endpoints.comments(connectionId, itemId), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ body: comment } as CreateCommentPayload),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || (json && json.ok === false)) {
          const msg = json?.error?.message || `Failed to add comment (${res.status})`;
          throw new Error(msg);
        }
        setComment("");
        await mutate(endpoints.comments(connectionId, itemId));
      } catch (err) {
        console.error(err);
        alert((err as Error).message || "Failed to add comment");
      } finally {
        setSaving(false);
      }
    },
    [comment, connectionId, itemId]
  );

  return (
    <section aria-label="Item detail">
      <SectionHeader title="Item Detail" subtitle="Selected item with activity and comments." />
      {!itemId && (
        <div className="rounded-lg bg-white p-6 text-center ring-1 ring-gray-200">
          <p className="text-sm text-gray-600">Select an item from the Items tab to view details.</p>
        </div>
      )}
      {itemId && itemError && <ErrorBanner message="Failed to load item detail" />}
      {itemId && itemLoading && <LoadingSkeleton rows={2} />}

      {itemId && item && (
        <div className="space-y-4">
          <div className="rounded-lg bg-white p-4 ring-1 ring-gray-200">
            <h3 className="text-base font-semibold text-gray-900">{item.title}</h3>
            <p className="mt-0.5 text-xs text-gray-500">
              {item.status || "open"}{" "}
              {item.updatedAt ? `• updated ${new Date(item.updatedAt).toLocaleString()}` : ""}
            </p>
            {typeof item.raw !== 'undefined' && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm text-gray-700">Show raw</summary>
                <pre className="mt-2 overflow-auto rounded bg-gray-50 p-3 text-xs ring-1 ring-gray-200">
                  {JSON.stringify(item.raw as unknown, null, 2)}
                </pre>
              </details>
            )}
          </div>

          <div className="rounded-lg bg-white p-4 ring-1 ring-gray-200">
            <h4 className="text-sm font-semibold text-gray-900">Comments</h4>
            {commentsError && <ErrorBanner message="Failed to load comments" />}
            {commentsLoading && <LoadingSkeleton rows={2} />}
            {comments && comments.length === 0 && (
              <p className="mt-2 text-sm text-gray-600">No comments yet. Be the first to add one.</p>
            )}
            {comments && comments.length > 0 && (
              <ul className="mt-2 space-y-3">
                {comments.map((c) => (
                  <li key={c.id} className="rounded-md bg-gray-50 p-3 ring-1 ring-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-800">{c.author || "User"}</span>
                      <span className="text-xs text-gray-500">
                        {c.createdAt ? new Date(c.createdAt).toLocaleString() : ""}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{c.body}</p>
                  </li>
                ))}
              </ul>
            )}

            <form onSubmit={onAddComment} className="mt-3">
              <label htmlFor="new-comment" className="sr-only">
                New comment
              </label>
              <textarea
                id="new-comment"
                placeholder="Add a comment..."
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className={`rounded-md px-3 py-2 text-sm font-medium text-white ${
                    saving ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                  }`}
                  aria-label="Add comment"
                >
                  {saving ? "Posting..." : "Post Comment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

function RawJson({
  connection,
}: {
  connection: ConnectionDetail | null | undefined;
}) {
  return (
    <section aria-label="Raw JSON">
      <SectionHeader title="Raw JSON" subtitle="Inspect the unified envelope or raw backend payloads." />
      <div className="rounded-lg bg-white p-4 ring-1 ring-gray-200">
        <pre className="overflow-auto text-xs">{JSON.stringify(connection ?? null, null, 2)}</pre>
      </div>
    </section>
  );
}

/**
 * Page
 */
/**
 * For static export builds (next.config.ts output: "export"), dynamic params must be known at build time.
 * The connections detail page depends on runtime backend data and cannot be pre-rendered statically.
 * We explicitly error during export to signal this constraint while keeping dev/start environments functional.
 */


// PUBLIC_INTERFACE
export default function ConnectionDetailPage() {
  /**
   * A detailed view for a specific connection:
   * - Containers tab: list containers (projects/spaces)
   * - Items tab: list/search items; create new item
   * - Item tab: show selected item details and comments; add comment
   * - Raw JSON tab: debug the raw envelope
   * Uses SWR + unified envelope handling; Ocean Professional styling via Tailwind.
   */
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const id = params?.id;
  if (!id) {
    notFound();
  }

  const tabParam = (searchParams.get("tab") as TabKey) || "containers";
  const [activeTab, setActiveTab] = useState<TabKey>(tabParam);

  // Keep tab in the URL for deep-linking
  const onTabChange = useCallback(
    (key: TabKey) => {
      const usp = new URLSearchParams(searchParams.toString());
      usp.set("tab", key);
      // If switching away from item tab, do not keep itemId
      if (key !== "item") usp.delete("itemId");
      router.push(`?${usp.toString()}`);
      setActiveTab(key);
    },
    [router, searchParams]
  );

  // Load connection detail (also used in Raw tab)
  const { data: connection, error: connError, isLoading: connLoading } = useSWR<ConnectionDetail | null>(
    id ? endpoints.connection(id) : null,
    (url: string) => envelopeFetcher<ConnectionDetail | null>(url),
    { revalidateOnFocus: true, revalidateOnReconnect: true }
  );

  return (
    <main
      className="min-h-screen"
      style={{ background: "linear-gradient(to bottom right, rgba(59,130,246,0.08), #f9fafb)" }}
    >
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Connection</h1>
            <p className="mt-1 text-sm text-gray-600">
              Browse containers and items for this connection. Manage activity and comments.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="rounded-md bg-white px-3 py-2 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-200 hover:bg-blue-50"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Connection header card */}
        <div className="mb-4 rounded-xl bg-white p-4 ring-1 ring-gray-200">
          {connError && <ErrorBanner message="Failed to load connection" />}
          {connLoading && <div className="h-16 animate-pulse rounded-lg bg-gray-50" />}
          {connection && (
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  {connection.displayName || connection.connectorKey}{" "}
                  <span className="ml-2 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-200">
                    {connection.status}
                  </span>
                </h2>
                <p className="mt-0.5 text-xs text-gray-500">ID: {connection.id}</p>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <TabNav active={activeTab} onChange={onTabChange} />

        <div className="mt-4">
          {activeTab === "containers" && id && <ContainersList connectionId={id} />}
          {activeTab === "items" && id && <ItemsPanel connectionId={id} />}
          {activeTab === "item" && id && <ItemDetail connectionId={id} />}
          {activeTab === "raw" && <RawJson connection={connection} />}
        </div>
      </div>
    </main>
  );
}
