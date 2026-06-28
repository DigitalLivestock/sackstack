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
import { ThemeToggle } from "@/components/ThemeToggle";
import { getThemeScript, useTheme } from "@/hooks/use-theme";

function Footer() {
  return (
    <footer className="border-t border-border bg-background/50">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>No accounts. No tracking. Your data stays in this browser.</span>
            <span className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              <span>Made in Sweden</span>
              <svg aria-hidden="true" width="14" height="10" viewBox="0 0 16 10" className="shrink-0">
                <rect width="16" height="10" fill="#006AA7" />
                <rect x="5" y="0" width="2" height="10" fill="#FECC02" />
                <rect x="0" y="4" width="16" height="2" fill="#FECC02" />
              </svg>
            </span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <DisplayUnitSelect />
          <span className="text-muted-foreground">v{APP_VERSION}</span>
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
      { title: "Sack Stack | Organize Your Packing | Free & privacy-focused" },
      { name: "description", content: "Free & privacy-focused. Plan and balance the weight of your bags before a trip." },
      { name: "author", content: "Sack Stack" },
      { property: "og:title", content: "Sack Stack | Organize Your Packing | Free & privacy-focused" },
      { property: "og:description", content: "Free & privacy-focused. Plan and balance the weight of your bags before a trip." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@SackStack" },
      { name: "twitter:title", content: "Sack Stack | Organize Your Packing | Free & privacy-focused" },
      { name: "twitter:description", content: "Free & privacy-focused. Plan and balance the weight of your bags before a trip." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/64IUN71CzBb9JdNd2Uz4SdqygZk1/social-images/social-1782605328617-Screenshot_2026-06-28_020839.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/64IUN71CzBb9JdNd2Uz4SdqygZk1/social-images/social-1782605328617-Screenshot_2026-06-28_020839.webp" },
      { name: "theme-color", content: "#0d7d6c" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: "Sack Stack" },
      { name: "google-site-verification", content: "4dcVtkYhvpHQhorFW2dbT-rKgjd2s00Hu4VMHug9V3E" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/svg+xml", href: logoUrl },
      { rel: "apple-touch-icon", href: logoUrl },
      { rel: "manifest", href: "/manifest.webmanifest" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Sack Stack",
          description: "Free, privacy-focused packing planner. Balance the weight of every bag, assign carriers, and print your packing list.",
          applicationCategory: "TravelApplication",
          operatingSystem: "Web",
          url: "https://sackstack.app",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
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
        <script dangerouslySetInnerHTML={{ __html: getThemeScript() }} />
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
  const { theme } = useTheme();

  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", theme === "dark" ? "#0a3d35" : "#0d7d6c");
    }
  }, [theme]);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <Footer />
    </QueryClientProvider>
  );
}
