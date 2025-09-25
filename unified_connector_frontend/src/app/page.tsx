'use client';

import Link from 'next/link';
import { Button, Card, Stat, SectionHeader } from '../components/ui';

export default function HomePage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <SectionHeader
        title="Unified Connector"
        subtitle="Connect, manage, and monitor integrations through a single, elegant interface."
        meta="Ocean Professional"
        cta={
          <div className="flex gap-3">
            <Link href="/wizard"><Button variant="primary">Create connection</Button></Link>
            <Link href="/dashboard"><Button variant="outline">View dashboard</Button></Link>
          </div>
        }
      />

      <div className="card-grid">
        <Stat label="Active connections" value="12" delta="+2 this week" />
        <Stat label="Available connectors" value="18" />
        <Stat label="Tasks processed" value="4,281" delta="+8%" />
      </div>

      <Card
        title="Get started"
        subtitle="Use the wizard to add a new connection and authorize access."
        actions={<Link href="/wizard"><Button variant="secondary">Open wizard</Button></Link>}
      >
        <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
          <li>Choose a connector and follow the guided steps.</li>
          <li>Review connection details and grant permissions.</li>
          <li>Start syncing and monitor status on the dashboard.</li>
        </ul>
      </Card>
    </main>
  );
}
