'use client';

import Link from 'next/link';
import { Button, Card } from '../components/ui';

export default function NotFound() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Card
        title="Page not found"
        subtitle="The page you are looking for does not exist."
        actions={<Link href="/"><Button variant="primary">Go home</Button></Link>}
      />
    </main>
  );
}
