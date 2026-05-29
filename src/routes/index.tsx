import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Heart, Sparkles, Shield, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate({ to: "/home" });
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 pb-10 pt-12">
        <header className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-soft">
            <Heart className="h-5 w-5" fill="currentColor" />
          </div>
          <span className="text-lg font-semibold">HerSpace</span>
        </header>

        <main className="mt-12 flex-1">
          <h1 className="text-4xl font-bold leading-tight">
            A safe space for <span className="text-primary">your feelings</span>.
          </h1>
          <p className="mt-4 text-base text-muted-foreground">
            HerSpace is a warm, gentle companion for African girls 10–19. Talk, journal, track your
            mood, and find support — anytime, judgment-free.
          </p>

          <div className="mt-10 space-y-4">
            <Feature
              icon={<MessageCircle className="h-5 w-5" />}
              title="Talk it out"
              text="Chat with a kind AI that listens and understands."
            />
            <Feature
              icon={<Sparkles className="h-5 w-5" />}
              title="Track your mood"
              text="Notice patterns and celebrate small wins."
            />
            <Feature
              icon={<Shield className="h-5 w-5" />}
              title="Private & safe"
              text="Your journal is yours. We're here if things feel heavy."
            />
          </div>
        </main>

        <footer className="mt-10 space-y-3">
          <Button asChild size="lg" className="w-full rounded-full text-base">
            <Link to="/auth" search={{ mode: "signup" }}>
              Get started — it's free
            </Link>
          </Button>
          <Button asChild variant="ghost" size="lg" className="w-full rounded-full">
            <Link to="/auth" search={{ mode: "login" }}>
              I already have an account
            </Link>
          </Button>
          <p className="pt-2 text-center text-xs text-muted-foreground">
            HerSpace is emotional support, not a medical service.
          </p>
        </footer>
      </div>
    </div>
  );
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-card/70 p-4 shadow-soft backdrop-blur">
      <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-warm text-warm-foreground">
        {icon}
      </div>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}
