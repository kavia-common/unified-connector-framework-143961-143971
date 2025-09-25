'use client';

import Link from 'next/link';
import { Button, Card, Badge, SectionHeader } from '../../components/ui';

const mockConnections = [
  { id: '1', name: 'Salesforce', status: 'healthy' },
  { id: '2', name: 'GitHub', status: 'warning' },
  { id: '3', name: 'Google', status: 'healthy' },
  { id: '4', name: 'Stripe', status: 'error' },
];

export default function ConnectionsIndexPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <SectionHeader
        title="Connections"
        subtitle="Manage and monitor your configured integrations."
        cta={<Link href="/wizard"><Button variant="primary">Add connection</Button></Link>}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockConnections.map((c) => (
          <Card
            key={c.id}
            gradient
            actions={<Badge color={c.status === 'healthy' ? 'success' : c.status === 'warning' ? 'secondary' : 'error'}>{c.status}</Badge>}
            title={
              <span className="flex items-center gap-3">
                <span className="h-9 w-9 rounded-lg bg-blue-600/10 ring-1 ring-blue-600/20 text-blue-600 flex items-center justify-center font-semibold">
                  {c.name.charAt(0)}
                </span>
                <span>{c.name}</span>
              </span> as unknown as string
            }
            subtitle={`ID: ${c.id}`}
            footer={
              <div className="flex items-center justify-end gap-2">
                <Link href={`/connections/${c.id}`}><Button variant="outline" size="sm">Open</Button></Link>
                <Button variant="ghost" size="sm">Sync now</Button>
              </div>
            }
          >
            <p className="text-sm text-gray-600">View details, run syncs, or troubleshoot issues.</p>
          </Card>
        ))}
      </div>
    </main>
  );
}
