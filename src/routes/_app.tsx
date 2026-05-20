import { createFileRoute, Outlet, Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { userApi } from "@/api/user";
import { Home, MessageCircle, Smile, BookHeart, LifeBuoy, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app")({
  component: AppShell,
});

const tabs = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/chat", label: "Talk", icon: MessageCircle },
  { to: "/mood", label: "Mood", icon: Smile },
  { to: "/journal", label: "Journal", icon: BookHeart },
  { to: "/emergency", label: "Help", icon: LifeBuoy },
] as const;

function AppShell() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { mode: "login" } });
  }, [user, loading, navigate]);

  const { data: profile } = useQuery({
    queryKey: ["profile-gate", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const data = await userApi.getProfile();
      return data;
    },
  });

  useEffect(() => {
    if (profile && profile.onboarded === false) {
      navigate({ to: "/onboarding" });
    }
  }, [profile, navigate]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background">
      <main className="flex-1 pb-24">
        <Outlet />
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-30">
        <div className="mx-auto max-w-md px-4 pb-3">
          <div className="flex items-center justify-between rounded-full border border-border bg-card/95 px-2 py-1.5 shadow-soft backdrop-blur">
            {tabs.map((t) => {
              const active = location.pathname.startsWith(t.to);
              const Icon = t.icon;
              return (
                <Link
                  key={t.to}
                  to={t.to}
                  className={cn(
                    "flex flex-1 flex-col items-center gap-0.5 rounded-full py-2 text-[10px] font-medium transition-colors",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <Icon className={cn("h-5 w-5", active && "fill-primary/20")} />
                  {t.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
