import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { getProfile } from "@/api/user";
import { moodApi } from "@/api/mood";
import { MessageCircle, Smile, BookHeart, LifeBuoy, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_app/home")({
  component: HomePage,
});

function HomePage() {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: getProfile,
  });

  const { data: lastMood } = useQuery({
    queryKey: ["mood-latest", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const entries = await moodApi.getMoodEntries(1);
      return entries.length > 0 ? entries[entries.length - 1] : null;
    },
  });

  const greeting = greetingForHour();
  const name = profile?.fullName?.split(" ")[0] || "friend";

  return (
    <div className="px-5 pt-10">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{greeting},</p>
          <h1 className="text-2xl font-bold">{name} 💛</h1>
        </div>
        <Link
          to="/profile"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-secondary-foreground"
        >
          {name[0]?.toUpperCase()}
        </Link>
      </div>

      <Link to="/chat" className="mt-7 block rounded-3xl bg-gradient-warm p-5 shadow-soft">
        <div className="flex items-center gap-2 text-warm-foreground">
          <Sparkles className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wide">HerMind chat</span>
        </div>
        <p className="mt-2 text-lg font-semibold leading-snug text-warm-foreground">
          How are you really feeling today?
        </p>
        <p className="mt-1 text-sm text-warm-foreground/80">
          Tap to talk. I'm listening, no judgment.
        </p>
      </Link>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <QuickCard
          to="/mood"
          icon={<Smile className="h-5 w-5" />}
          title="Log mood"
          subtitle={lastMood ? `Last: ${lastMood.mood}` : "Start tracking"}
          tone="calm"
        />
        <QuickCard
          to="/journal"
          icon={<BookHeart className="h-5 w-5" />}
          title="Journal"
          subtitle="Write it out"
          tone="secondary"
        />
        <QuickCard
          to="/emergency"
          icon={<LifeBuoy className="h-5 w-5" />}
          title="Need help?"
          subtitle="Quick support"
          tone="warm"
        />
        <QuickCard
          to="/chat"
          icon={<MessageCircle className="h-5 w-5" />}
          title="Talk to HerMind"
          subtitle="Anytime"
          tone="primary"
        />
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Today's gentle reminder
        </p>
        <p className="mt-2 text-sm leading-relaxed">
          You don't have to be okay all the time. Feeling things deeply means you have a big,
          beautiful heart. 🌸
        </p>
      </div>
    </div>
  );
}

function greetingForHour() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function QuickCard({
  to,
  icon,
  title,
  subtitle,
  tone,
}: {
  to: "/mood" | "/journal" | "/emergency" | "/chat";
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  tone: "calm" | "secondary" | "warm" | "primary";
}) {
  const toneClasses = {
    calm: "bg-calm text-calm-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    warm: "bg-warm text-warm-foreground",
    primary: "bg-primary text-primary-foreground",
  }[tone];
  return (
    <Link
      to={to}
      className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft"
    >
      <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${toneClasses}`}>
        {icon}
      </div>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </Link>
  );
}
