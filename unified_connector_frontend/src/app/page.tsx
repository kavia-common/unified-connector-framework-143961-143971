'use client';

import React from 'react';
import Button from '../components/ui/Button';
import ErrorBanner from '../components/ui/ErrorBanner';
import Spinner from '../components/ui/Spinner';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';

export default function Home() {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const simulateAction = async () => {
    setError(null);
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    if (Math.random() < 0.5) {
      setError('Failed to complete the simulated action. Please try again.');
    }
    setLoading(false);
  };

  return (
    <main className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Unified Connector Framework</h1>
        <p className="text-gray-600">
          Build, connect, and manage integrations via a unified envelope.
        </p>
      </div>

      {error && (
        <ErrorBanner
          message={error}
          onRetry={() => {
            setError(null);
            simulateAction();
          }}
          onDismiss={() => setError(null)}
        />
      )}

      <Card
        title="Ocean Components Demo"
        subtitle="Reusable UI components with Ocean Professional theme."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => setOpen(true)}>
              Open Modal
            </Button>
            <Button variant="primary" loading={loading} onClick={simulateAction}>
              {loading ? 'Working...' : 'Simulate Action'}
            </Button>
          </div>
        }
        footer={
          <div className="text-sm text-gray-600">
            Tip: Click &quot;Open Modal&quot; to see the modal component. Use &quot;Simulate Action&quot; to test loading and errors.
          </div>
        }
      >
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="primary" size="sm">
            Small
          </Button>
          <Button variant="primary" size="lg">
            Large
          </Button>
        </div>

        <div className="mt-6 flex items-center gap-6">
          <Spinner label="Fetching connectors..." />
          <Spinner color="secondary" size="lg" label="Syncing resources..." />
          <Spinner color="neutral" size="sm" label="Preparing..." />
        </div>
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Ocean Modal"
        description="A reusable modal component with keyboard support and Ocean styling."
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Close
            </Button>
            <Button variant="primary" onClick={() => setOpen(false)}>
              Confirm
            </Button>
          </div>
        }
      >
        <p className="text-gray-700">
          This is a demo modal content area. Place forms or confirmation dialogs here.
        </p>
      </Modal>
    </main>
  );
}
