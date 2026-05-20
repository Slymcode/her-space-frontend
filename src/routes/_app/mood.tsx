import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { moodApi, OrchestrationResult } from "@/api/mood";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/_app/mood")({
  component: MoodPage,
});

const MOODS = [
  { key: "happy", label: "Happy", emoji: "😊", score: 5 },
  { key: "calm", label: "Calm", emoji: "🌿", score: 4 },
  { key: "tired", label: "Tired", emoji: "😴", score: 3 },
  { key: "stressed", label: "Stressed", emoji: "😣", score: 2 },
  { key: "sad", label: "Sad", emoji: "😢", score: 2 },
  { key: "anxious", label: "Anxious", emoji: "😰", score: 2 },
  { key: "angry", label: "Angry", emoji: "😠", score: 2 },
  { key: "lonely", label: "Lonely", emoji: "💭", score: 2 },
];

function MoodPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [picked, setPicked] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [orchestration, setOrchestration] = useState<OrchestrationResult | null>(null);

  const { data: logs = [] } = useQuery({
    queryKey: ["moods", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const data = await moodApi.getMoodEntries(14);
      return data.slice().reverse();
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const m = MOODS.find((x) => x.key === picked);
      if (!m || !user) throw new Error("Pick a mood");
      return await moodApi.createMoodEntry({
        mood: m.key,
        score: m.score,
        note: note.trim() || null,
      });
    },
    onSuccess: (data) => {
      toast.success(
        data?.orchestration?.aiResponse ? (
          <div className="space-y-1">
            <p>Saved 💛</p>
            <p className="text-sm leading-snug">{data.orchestration.aiResponse}</p>
          </div>
        ) : (
          "Saved 💛"
        ),
      );
      setPicked(null);
      setNote("");
      setOrchestration(data?.orchestration ?? null);
      qc.invalidateQueries({ queryKey: ["moods", user?.id] });
      qc.invalidateQueries({ queryKey: ["mood-latest", user?.id] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  return (
    <div className="px-5 pt-10">
      <h1 className="text-2xl font-bold">How are you feeling?</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        There's no wrong answer. Just notice what's true today.
      </p>

      <div className="mt-6 grid grid-cols-4 gap-2">
        {MOODS.map((m) => (
          <button
            key={m.key}
            onClick={() => setPicked(m.key)}
            className={`flex flex-col items-center gap-1 rounded-2xl border p-3 text-xs transition ${
              picked === m.key
                ? "border-primary bg-primary/10"
                : "border-border bg-card"
            }`}
          >
            <span className="text-2xl">{m.emoji}</span>
            <span className="font-medium">{m.label}</span>
          </button>
        ))}
      </div>

      <Textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Anything you want to say about it? (optional)"
        rows={3}
        className="mt-5 rounded-2xl"
      />
      <Button
        onClick={() => save.mutate()}
        disabled={!picked || save.isPending}
        size="lg"
        className="mt-3 w-full rounded-full"
      >
        Save mood
      </Button>

      {orchestration && (
        <div className="mt-6 rounded-2xl border border-border bg-card p-4">
          <p className="text-sm font-semibold">HerMind response</p>
          <p className="mt-3 text-sm leading-relaxed">{orchestration.aiResponse}</p>
          {orchestration.recommendations.length > 0 && (
            <div className="mt-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Try this
              </p>
              <ul className="mt-2 space-y-2 text-sm">
                {orchestration.recommendations.map((recommendation, index) => (
                  <li key={index} className="list-disc pl-4">
                    {recommendation}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <h2 className="mt-8 text-lg font-semibold">Recent</h2>
      <div className="mt-3 space-y-2">
        {logs.length === 0 && (
          <p className="text-sm text-muted-foreground">Your moods will show here.</p>
        )}
        {logs.map((l) => {
          const m = MOODS.find((x) => x.key === l.mood);
          return (
            <div
              key={l.id}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
            >
              <span className="text-2xl">{m?.emoji ?? "💛"}</span>
              <div className="flex-1">
                <p className="text-sm font-medium capitalize">{l.mood}</p>
                {l.note && <p className="text-xs text-muted-foreground">{l.note}</p>}
              </div>
              <p className="text-xs text-muted-foreground">
                {format(new Date(l.createdAt), "MMM d")}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
