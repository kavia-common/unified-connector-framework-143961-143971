'use client';

import Link from 'next/link';
import { Button, Card, Stat, SectionHeader } from '../../components/ui';

export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <SectionHeader
        title="Dashboard"
        subtitle="High-level overview of your integrations and activity."
        cta={<Link href="/connections"><Button variant="primary">Manage connections</Button></Link>}
      />

      <div className="card-grid">
        <Stat label="Healthy" value="10" delta="+1" />
        <Stat label="Errors" value="2" />
        <Stat label="Queued jobs" value="36" />
      </div>

      <Card
        title="Recent activity"
        subtitle="Latest syncs and events across your connections."
        actions={<Link href="/connections"><Button variant="outline" size="sm">View all</Button></Link>}
      >
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Sync completed · Salesforce</span>
            <span className="text-gray-500">3m ago</span>
          </div>
          <div className="soft-divider" />
          <div className="flex items-center justify-between">
            <span className="text-gray-700">New webhook event · GitHub</span>
            <span className="text-gray-500">18m ago</span>
          </div>
          <div className="soft-divider" />
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Auth refresh · Google</span>
            <span className="text-gray-500">1h ago</span>
          </div>
        </div>
      </Card>
    </main>
  );
}
