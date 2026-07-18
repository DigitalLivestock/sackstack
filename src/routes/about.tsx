import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft, Backpack, Shield, Share2, FileJson, CheckSquare, Weight, Github, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logoSvg from '@/assets/logo.svg';

const APP_VERSION = "1.0.0";

export const Route = createFileRoute('/about')({
  head: () => ({
    meta: [
      { title: 'About — Sack Stack | bag packing planner & weight tracker' },
      {
        name: 'description',
        content:
          'Learn what Sack Stack does and how this free bag packing planner with weight tracking helps you organize any trip.',
      },
      { property: 'og:title', content: 'About — Sack Stack | bag packing planner & weight tracker' },
      {
        property: 'og:description',
        content: 'Free bag packing planner with weight tracking. Plan and balance packing weights for any trip, with any carrier.',
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-accent/30">
      <header className="border-b border-border bg-background/70 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <Button asChild variant="ghost" size="icon">
            <Link to="/" aria-label="Back">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-lg font-semibold">About</h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-4">
            <img src={logoSvg} alt="" className="h-16 w-auto shrink-0 object-contain" />
            <div>
              <h2 className="text-2xl font-bold text-foreground">Sack Stack</h2>
              <p className="text-sm text-muted-foreground">Version {APP_VERSION}</p>
            </div>
          </div>

          <p className="text-base leading-relaxed">
            Sack Stack is a free bag packing planner with weight tracking. It helps you organize and balance the weight of your bags before any trip.
            Whether you are hiking, camping, or traveling with checked luggage, you can plan
            exactly what goes where and make sure no single bag — or carrier — ends up overloaded.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <Feature
              icon={<Backpack className="h-5 w-5 text-primary" />}
              title="Multiple bags & carriers"
              description="Create any number of bags and assign them to people, pets, vehicles, or anything that carries a load."
            />
            <Feature
              icon={<Weight className="h-5 w-5 text-primary" />}
              title="Weight tracking"
              description="Every item and bag has a weight. See running totals, warnings when bags get heavy, and balance across carriers."
            />
            <Feature
              icon={<CheckSquare className="h-5 w-5 text-primary" />}
              title="Packing checklist"
              description="Mark items as packed and review your progress with a dedicated checklist view."
            />
            <Feature
              icon={<FileJson className="h-5 w-5 text-primary" />}
              title="Import & export"
              description="Back up your trips as JSON files and restore them anywhere. Import item lists directly into an unpacked tray."
            />
            <Feature
              icon={<Share2 className="h-5 w-5 text-primary" />}
              title="Share trips"
              description="Generate a link that encodes your trip right in the URL. Recipients open it and get the full plan instantly."
            />
            <Feature
              icon={<Shield className="h-5 w-5 text-primary" />}
              title="Privacy first"
              description="No accounts, no login, no tracking. All data stays in your browser and is never sent to any server."
            />
            <Feature
              icon={<Github className="h-5 w-5 text-primary" />}
              title="Open source"
              description="The source code is public on GitHub. Inspect how the app works, file issues, or contribute improvements."
            />
          </div>

          <div className="rounded-xl border border-border bg-background/60 p-4 text-sm text-muted-foreground">
            <p>
              This is a fully client-side web app. It is designed to work offline as a PWA and
              can be installed on your phone or desktop. If you ever want to start fresh,
              visit the <Link to="/privacy" className="underline underline-offset-2 hover:text-foreground">Privacy &amp; data</Link> page to clear everything.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-background/60 p-4 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <Code2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div className="space-y-2">
                <p className="font-medium text-foreground">Transparency</p>
                <p>
                  Sack Stack is open-source software. The code that runs here is the same code
                  published on{' '}
                  <a
                    href="https://github.com/DigitalLivestock/sackstack"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 hover:text-foreground"
                  >
                    GitHub
                  </a>
                  , so anyone can verify what the app does, how data is handled, and what is
                  (or isn't) sent to a server. No hidden tracking, no obfuscated logic, and no
                  surprises in the privacy policy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3 rounded-lg border border-border bg-background/50 p-3">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
