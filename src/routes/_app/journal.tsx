import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { journalApi, OrchestrationResult } from "@/api/journal";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format } from "date-fns";
import { Plus, Trash2, X } from "lucide-react";

export const Route = createFileRoute("/_app/journal")({
  component: JournalPage,
});

function JournalPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [orchestration, setOrchestration] = useState<OrchestrationResult | null>(null);

  const { data: entries = [] } = useQuery({
    queryKey: ["journal", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const data = await journalApi.getJournalEntries();
      return data.slice().reverse();
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      if (!user || !content.trim()) throw new Error("Write something first");
      return await journalApi.createJournalEntry({
        title: title.trim() || "Untitled",
        content: content.trim(),
      });
    },
    onSuccess: (data) => {
      toast.success(
        data?.orchestration?.aiResponse ? (
          <div className="space-y-1">
            <p>Saved to your journal</p>
            <p className="text-sm leading-snug">{data.orchestration.aiResponse}</p>
          </div>
        ) : (
          "Saved to your journal"
        ),
      );
      setOpen(false);
      setTitle("");
      setContent("");
      setOrchestration(data?.orchestration ?? null);
      qc.invalidateQueries({ queryKey: ["journal", user?.id] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      await journalApi.deleteJournalEntry(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["journal"] }),
  });

  return (
    <div className="px-5 pt-10">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">Your journal</h1>
          <p className="text-sm text-muted-foreground">Private. Just for you.</p>
        </div>
        <Button
          onClick={() => {
            setOpen(true);
            setOrchestration(null);
          }}
          size="icon"
          className="rounded-full"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {orchestration && (
        <div className="mt-6 rounded-2xl border border-border bg-card p-4">
          <p className="text-sm font-semibold">HerMind response</p>
          <p className="mt-3 text-sm leading-relaxed">{orchestration.aiResponse}</p>
          {orchestration.recommendations.length > 0 && (
            <div className="mt-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Try this</p>
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

      <div className="mt-6 space-y-3">
        {entries.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Tap + to write your first entry.
          </div>
        )}
        {entries.map((e) => (
          <div key={e.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                {e.title && <p className="font-semibold">{e.title}</p>}
                <p className="text-xs text-muted-foreground">
                  {format(new Date(e.createdAt), "EEE, MMM d • p")}
                </p>
              </div>
              <button
                onClick={() => remove.mutate(e.id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{e.content}</p>
          </div>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
          <div className="w-full max-w-md rounded-t-3xl bg-card p-5 shadow-soft sm:rounded-3xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">New entry</h2>
              <button onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <Input
              placeholder="Title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-4 rounded-xl"
            />
            <Textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="mt-3 rounded-xl"
            />
            <Button
              onClick={() => create.mutate()}
              disabled={create.isPending}
              size="lg"
              className="mt-4 w-full rounded-full"
            >
              Save entry
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
