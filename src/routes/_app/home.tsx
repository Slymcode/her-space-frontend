import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { getProfile } from "@/api/user";
import { moodApi, MoodStats } from "@/api/mood";
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

  const { data: moodStats } = useQuery<MoodStats>({
    queryKey: ["mood-stats", user?.id],
    enabled: !!user,
    queryFn: async () => {
      return await moodApi.getMoodStats(7);
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

      {moodStats && (
        <div className="mt-6 rounded-4xl border border-transparent bg-linear-to-br from-[#f5f0ff] via-[#fff7f0] to-[#fdf4ff] p-px shadow-soft">
          <div className="rounded-[1.75rem] bg-card p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Weekly mood insight
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  {moodStats.totalEntries > 0 ? "Your emotional snapshot" : "No moods logged yet"}
                </h2>
              </div>
              <div className="rounded-3xl bg-primary/10 px-4 py-3 text-primary shadow-sm">
                <p className="text-xs uppercase tracking-wide text-primary/70">Average mood</p>
                <p className="mt-2 text-3xl font-bold">
                  {moodStats.totalEntries > 0 ? moodStats.averageIntensity.toFixed(1) : "—"}
                </p>
                <p className="text-xs text-primary/80">out of 5</p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-[3fr_2fr]">
              <div className="rounded-3xl bg-slate-950/5 p-4">
                <p className="text-sm font-semibold">This week at a glance</p>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  {(() => {
                    const avg = moodStats.averageIntensity ?? null;
                    if (moodStats.totalEntries === 0)
                      return "Log your moods to see how your emotional status is shaping up over the week.";
                    if (avg >= 4.5)
                      return "You’ve been feeling joyful and steady, with more bright moments than not.";
                    if (avg >= 3)
                      return "A balanced week with a mix of calm and emotional moments.";
                    if (avg >= 2)
                      return "It’s been a bit bumpy—take extra care of yourself in the next few days.";
                    return "This week has been tough. Reach out to someone you trust or use the support tools here.";
                  })()}
                </p>
              </div>

              <div className="rounded-3xl bg-slate-950/5 p-4">
                <p className="text-sm font-semibold">Mood mix</p>
                <div className="mt-4 space-y-3">
                  {Object.entries(moodStats.moodCounts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([mood, count]) => {
                      const barWidth = Math.min(
                        (count / Math.max(...Object.values(moodStats.moodCounts))) * 100,
                        100,
                      );
                      return (
                        <div key={mood}>
                          <div className="flex items-center justify-between text-sm font-medium text-slate-700">
                            <span>
                              {moodEmoji(mood)} {capitalize(mood)}
                            </span>
                            <span>{count}</span>
                          </div>
                          <div className="mt-2 h-2 rounded-full bg-slate-200">
                            <div
                              className="h-2 rounded-full bg-linear-to-r from-primary to-pink-500"
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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

function moodEmoji(mood: string) {
  const map: Record<string, string> = {
    happy: "😊",
    calm: "🌿",
    tired: "😴",
    stressed: "😣",
    sad: "😢",
    anxious: "😰",
    angry: "😠",
    lonely: "💭",
  };
  return map[mood.toLowerCase()] ?? "💛";
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
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
