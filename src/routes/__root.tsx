const APP_VERSION = "1.0.0";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import logoUrl from "../assets/logo.svg?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { DisplayUnitSelect } from "@/components/bag-planner/DisplayUnitSelect";

function Footer() {
  return (
    <footer className="border-t border-border bg-background/50">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground">
        <span>No accounts. No tracking. Your data stays in this browser.</span>
        <div className="flex items-center gap-3">
          <DisplayUnitSelect />
          <span className="text-muted-foreground/60">v{APP_VERSION}</span>
          <Link to="/about" className="underline-offset-2 hover:underline">
            About
          </Link>
          <Link to="/privacy" className="underline-offset-2 hover:underline">
            Privacy &amp; data
          </Link>
        </div>
      </div>
    </footer>
  );
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Bag Planner | Organize your Voyage" },
      { name: "description", content: "Bag Buddy Planner helps users plan and track item weights for trips, supporting multiple users and travel types." },
      { name: "author", content: "Bag Planner" },
      { property: "og:title", content: "Bag Planner | Organize your Voyage" },
      { property: "og:description", content: "Bag Buddy Planner helps users plan and track item weights for trips, supporting multiple users and travel types." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@BagPlanner" },
      { name: "twitter:title", content: "Bag Planner | Organize your Voyage" },
      { name: "twitter:description", content: "Bag Buddy Planner helps users plan and track item weights for trips, supporting multiple users and travel types." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/8f2f0d30-afda-426c-b4ef-4740a0755ab0/id-preview-391e54f8--e28bdc44-70dd-426c-950e-7b8ab4a70580.lovable.app-1782591201426.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/8f2f0d30-afda-426c-b4ef-4740a0755ab0/id-preview-391e54f8--e28bdc44-70dd-426c-950e-7b8ab4a70580.lovable.app-1782591201426.png" },
      { name: "theme-color", content: "#0d7d6c" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: "Bag Planner" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/svg+xml", href: logoUrl },
      { rel: "apple-touch-icon", href: logoUrl },
      { rel: "manifest", href: "/manifest.webmanifest" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <Footer />
    </QueryClientProvider>
  );
}
