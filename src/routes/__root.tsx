import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth-context";

import appCss from "../styles.css?url";

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <p className="mt-4 text-muted-foreground">This page doesn't exist.</p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "HerSpace AI — A safe space for your feelings" },
      {
        name: "description",
        content:
          "HerSpace AI is a warm, culturally aware emotional support companion for African girls aged 10–19.",
      },
      { name: "theme-color", content: "#f5d6c0" },
      { property: "og:title", content: "HerSpace AI — A safe space for your feelings" },
      { name: "twitter:title", content: "HerSpace AI — A safe space for your feelings" },
      {
        name: "description",
        content:
          "HerSpace Companion is a hybrid AI and rule-based mobile app providing culturally aware mental wellness support for African girls aged 10-19.",
      },
      {
        property: "og:description",
        content:
          "HerSpace Companion is a hybrid AI and rule-based mobile app providing culturally aware mental wellness support for African girls aged 10-19.",
      },
      {
        name: "twitter:description",
        content:
          "HerSpace Companion is a hybrid AI and rule-based mobile app providing culturally aware mental wellness support for African girls aged 10-19.",
      },
      {
        property: "og:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/af2f0990-0093-4c8f-9d24-de06d7c1367f/id-preview-ee7aeb08--10193c01-0822-4e46-88d6-79ec5435c335.lovable.app-1778537604827.png",
      },
      {
        name: "twitter:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/af2f0990-0093-4c8f-9d24-de06d7c1367f/id-preview-ee7aeb08--10193c01-0822-4e46-88d6-79ec5435c335.lovable.app-1778537604827.png",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFound,
});

function RootShell({ children }: { children: React.ReactNode }) {
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
      <AuthProvider>
        <Outlet />
        <Toaster richColors position="top-center" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
