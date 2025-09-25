"use server";

/**
 * PUBLIC_INTERFACE
 * generateStaticParams
 * Required for Next.js static export when using a dynamic segment ([id]).
 * We return an empty array so no dynamic pages are pre-rendered at build time.
 * Client-side navigation will handle fetching when running.
 */
export default function generateStaticParams(): Array<{ id: string }> {
  return [];
}
