import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { userApi } from "@/api/user";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Heart, Loader2, ArrowRight, ArrowLeft, Sparkles, Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/onboarding")({
  component: OnboardingPage,
});

const GOALS = [
  { id: "manage-stress", label: "Manage stress & school pressure", emoji: "📚" },
  { id: "boost-confidence", label: "Build self-confidence", emoji: "✨" },
  { id: "handle-emotions", label: "Understand my emotions", emoji: "💗" },
  { id: "feel-less-alone", label: "Feel less alone", emoji: "🤝" },
  { id: "sleep-better", label: "Sleep & rest better", emoji: "🌙" },
  { id: "deal-with-bullying", label: "Deal with bullying or teasing", emoji: "🛡️" },
  { id: "family-issues", label: "Cope with family issues", emoji: "🏠" },
  { id: "body-image", label: "Feel good in my body", emoji: "🌸" },
];

const TRIGGERS = [
  { id: "school", label: "School & exams" },
  { id: "family", label: "Family conflict" },
  { id: "friends", label: "Friendship problems" },
  { id: "money", label: "Money / school fees" },
  { id: "appearance", label: "How I look" },
  { id: "loneliness", label: "Feeling lonely" },
  { id: "future", label: "My future" },
  { id: "boys-relationships", label: "Boys / relationships" },
  { id: "religion", label: "Religious pressure" },
  { id: "abuse", label: "Unsafe situations" },
];

const COUNTRIES = [
  "Nigeria",
  "Kenya",
  "Ghana",
  "South Africa",
  "Uganda",
  "Tanzania",
  "Rwanda",
  "Ethiopia",
  "Other",
];

function OnboardingPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [pronouns, setPronouns] = useState("she/her");
  const [country, setCountry] = useState("");
  const [language, setLanguage] = useState("en");
  const [goals, setGoals] = useState<string[]>([]);
  const [triggers, setTriggers] = useState<string[]>([]);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth", search: { mode: "login" } });
  }, [user, authLoading, navigate]);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile-onboarding", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const data = await userApi.getProfile();
      return data;
    },
  });

  useEffect(() => {
    if (profile) {
      if (profile.onboarded) {
        navigate({ to: "/home" });
        return;
      }
      setName(profile.firstName || "");
      setAge(profile.age ? String(profile.age) : "");
      setPronouns(profile.pronouns || "she/her");
      setCountry(profile.country || "");
      setLanguage(profile.preferred_language || "en");
      setGoals(profile.emotional_goals || []);
      setTriggers(profile.stress_triggers || []);
    }
  }, [profile, navigate]);

  function toggle(list: string[], setList: (v: string[]) => void, id: string) {
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  }

  const steps = [
    { title: "Welcome 💛", subtitle: "Let's get to know you a little." },
    { title: "What matters to you?", subtitle: "Pick the things you want to work on." },
    { title: "What weighs on you?", subtitle: "It helps me understand you better." },
    { title: "You're all set ✨", subtitle: "I'm so glad you're here." },
  ];

  function canNext() {
    if (step === 0) {
      const ageNum = parseInt(age, 10);
      return name.trim().length > 0 && ageNum >= 10 && ageNum <= 19 && country.length > 0;
    }
    if (step === 1) return goals.length >= 1;
    if (step === 2) return true;
    return true;
  }

  async function finish() {
    if (!user) return;
    setSaving(true);
    try {
      await userApi.updateProfile({
        firstName: name.trim(),
        age: parseInt(age, 10),
        pronouns,
        country,
        preferredLanguage: language,
        emotionalGoals: goals,
        stressTriggers: triggers,
        onboarded: true,
      });
      toast.success("Welcome to HerSpace 💛");
      navigate({ to: "/home" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save your info");
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background">
      <header className="flex items-center gap-3 px-5 pb-3 pt-10">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Heart className="h-5 w-5" fill="currentColor" />
        </div>
        <div className="flex-1">
          <p className="font-semibold">HerSpace</p>
          <p className="text-xs text-muted-foreground">
            Step {step + 1} of {steps.length}
          </p>
        </div>
      </header>

      <div className="px-5">
        <div className="flex gap-1.5">
          {steps.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                i <= step ? "bg-primary" : "bg-secondary",
              )}
            />
          ))}
        </div>
      </div>

      <main className="flex-1 px-5 py-6">
        <h1 className="text-2xl font-semibold tracking-tight">{steps[step].title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{steps[step].subtitle}</p>

        <div className="mt-6 space-y-5">
          {step === 0 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">What should I call you?</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={50}
                  placeholder="Your first name or nickname"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    inputMode="numeric"
                    value={age}
                    onChange={(e) => setAge(e.target.value.replace(/\D/g, "").slice(0, 2))}
                    placeholder="10–19"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pronouns">Pronouns</Label>
                  <select
                    id="pronouns"
                    value={pronouns}
                    onChange={(e) => setPronouns(e.target.value)}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="she/her">she/her</option>
                    <option value="they/them">they/them</option>
                    <option value="prefer-not">prefer not to say</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <select
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Select your country</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Preferred language</Label>
                <select
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="en">English</option>
                  <option value="sw">Kiswahili</option>
                  <option value="fr">Français</option>
                  <option value="ha">Hausa</option>
                  <option value="yo">Yorùbá</option>
                </select>
              </div>
            </>
          )}

          {step === 1 && (
            <div className="grid grid-cols-1 gap-2">
              {GOALS.map((g) => {
                const active = goals.includes(g.id);
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => toggle(goals, setGoals, g.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition-colors",
                      active
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-card text-foreground hover:border-primary/40",
                    )}
                  >
                    <span className="text-xl">{g.emoji}</span>
                    <span className="flex-1">{g.label}</span>
                    {active && <Check className="h-4 w-4 text-primary" />}
                  </button>
                );
              })}
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-wrap gap-2">
              {TRIGGERS.map((t) => {
                const active = triggers.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggle(triggers, setTriggers, t.id)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm transition-colors",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-foreground hover:border-primary/40",
                    )}
                  >
                    {t.label}
                  </button>
                );
              })}
              <p className="mt-2 w-full text-xs text-muted-foreground">
                You can skip this step if you'd rather not share right now.
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 rounded-3xl bg-secondary/60 p-5">
              <div className="flex items-center gap-2 text-secondary-foreground">
                <Sparkles className="h-5 w-5 text-primary" />
                <p className="font-medium">Hi {name || "friend"} 💛</p>
              </div>
              <p className="text-sm leading-relaxed text-secondary-foreground">
                Whatever you share with HerSpace stays private. I'm here whenever you want to talk,
                write in your journal, or check in with how you're feeling.
              </p>
              <p className="text-sm leading-relaxed text-secondary-foreground">
                If something ever feels too heavy, the <span className="font-semibold">Help</span>{" "}
                tab has trusted helplines and your emergency contacts.
              </p>
            </div>
          )}
        </div>
      </main>

      <footer className="sticky bottom-0 border-t border-border bg-background/95 px-5 py-4 backdrop-blur">
        <div className="flex items-center gap-3">
          {step > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setStep(step - 1)}
              disabled={saving}
              className="h-11 w-11 rounded-2xl"
              aria-label="Back"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          {step < steps.length - 1 ? (
            <Button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={!canNext()}
              className="h-11 flex-1 rounded-2xl"
            >
              Continue <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={finish}
              disabled={saving}
              className="h-11 flex-1 rounded-2xl"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Start using HerSpace"}
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
