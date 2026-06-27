import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast, Toaster } from 'sonner';

export const Route = createFileRoute('/privacy')({
  head: () => ({
    meta: [
      { title: 'Privacy — Sack Stack' },
      {
        name: 'description',
        content:
          'Sack Stack stores everything in your browser. No accounts, no tracking, no server-side database.',
      },
      { property: 'og:title', content: 'Privacy — Sack Stack' },
      {
        property: 'og:description',
        content: 'No accounts, no tracking. Your trips live only on your device.',
      },
      { property: 'og:url', content: 'https://bagplanner.lovable.app/privacy' },
    ],
    links: [{ rel: 'canonical', href: 'https://bagplanner.lovable.app/privacy' }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const [confirming, setConfirming] = useState(false);

  const clearAll = () => {
    try {
      window.localStorage.removeItem('bagplanner:trips');
      toast.success('All local data cleared');
      setTimeout(() => window.location.assign('/'), 600);
    } catch {
      toast.error('Could not clear storage');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-accent/30">
      <Toaster position="top-center" richColors />
      <header className="border-b border-border bg-background/70 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <Button asChild variant="ghost" size="icon">
            <Link to="/" aria-label="Back">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-lg font-semibold">Privacy &amp; data</h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <article className="prose prose-sm sm:prose-base max-w-none space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <p className="text-base">
            Sack Stack is a fully client-side app. It runs entirely in your
            browser — there is <strong>no account, no login, and no server-side
            database</strong>.
          </p>

          <h2 className="text-lg font-semibold">What we collect</h2>
          <p>
            <strong>Nothing personal.</strong> The site does not collect, store,
            or transmit your trips, items, names, or any other content you enter.
            We do not use analytics or tracking cookies.
          </p>

          <h2 className="text-lg font-semibold">Where your data lives</h2>
          <p>
            All trips, bags, carriers, and items are saved in your browser's
            <code className="rounded bg-muted px-1 py-0.5 text-xs"> localStorage</code>
            on this device only. They are never sent over the network. If you
            open the site on another device or browser, you will not see your
            trips there.
          </p>

          <h2 className="text-lg font-semibold">Backups</h2>
          <p>
            Browsers can clear <code className="rounded bg-muted px-1 py-0.5 text-xs">localStorage</code>
            at any time — privacy tools, disk cleanup, or "clear site data" will
            erase your trips. Before any important trip, use{' '}
            <strong>Export</strong> from the home screen to download a JSON
            backup, then use <strong>Import</strong> to restore it later.
          </p>

          <h2 className="text-lg font-semibold">Sharing</h2>
          <p>
            When you copy a share link for a trip, the trip data is encoded into
            the URL fragment (the part after <code>#</code>). URL fragments are{' '}
            <strong>not sent to any server</strong>; the recipient's browser
            decodes the trip locally. Only share the link with people you trust.
          </p>

          <h2 className="text-lg font-semibold">Hosting</h2>
          <p>
            The site is served as static files. The host can see standard request
            metadata (IP address, user agent) in their server logs, like any
            website, but receives none of your trip content.
          </p>

          <h2 className="text-lg font-semibold">Clear everything</h2>
          <p>
            Wipe all Sack Stack data from this browser. This cannot be undone —
            export a backup first if you want to keep your trips.
          </p>
          {!confirming ? (
            <Button variant="destructive" onClick={() => setConfirming(true)}>
              <Trash2 className="h-4 w-4" />
              Clear all data on this device
            </Button>
          ) : (
            <div className="flex flex-wrap items-center gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-3">
              <span className="text-sm">Are you sure? This deletes every trip.</span>
              <Button size="sm" variant="destructive" onClick={clearAll}>
                Yes, delete everything
              </Button>
              <Button size="sm" variant="outline" onClick={() => setConfirming(false)}>
                Cancel
              </Button>
            </div>
          )}
        </article>
      </main>
    </div>
  );
}
