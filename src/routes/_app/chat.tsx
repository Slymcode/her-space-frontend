import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { chatApi } from "@/api/chat";
import { Send, Heart, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/chat")({
  component: ChatPage,
});

interface Msg {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  is_crisis?: boolean;
}

function ChatPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: messages = [] } = useQuery<Msg[]>({
    queryKey: ["chat-messages", user?.id],
    enabled: !!user,
    queryFn: async () => {
      return await chatApi.getChatHistory(50);
    },
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, pending]);

  async function send() {
    if (!input.trim() || pending) return;
    const text = input.trim();
    setInput("");
    setPending(true);
    try {
      await chatApi.createChatMessage({
        content: text,
        role: "USER",
        type: "SUPPORT",
      });
      await qc.invalidateQueries({ queryKey: ["chat-messages", user?.id] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't send message");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex h-[100dvh] flex-col">
      <header className="flex items-center gap-3 border-b border-border bg-card/80 px-5 pb-3 pt-10 backdrop-blur">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Heart className="h-5 w-5" fill="currentColor" />
        </div>
        <div>
          <p className="font-semibold">HerMind</p>
          <p className="text-xs text-muted-foreground">Always here to listen</p>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-5">
        {messages.length === 0 && (
          <div className="mt-8 rounded-3xl bg-secondary/60 p-5 text-center">
            <p className="text-sm leading-relaxed text-secondary-foreground">
              Hi 💛 I'm HerMind. Tell me how your day has been, or whatever is on your heart.
              Whatever you say stays between us.
            </p>
          </div>
        )}
        <div className="space-y-3">
          {messages.map((m) => (
            <Bubble key={m.id} m={m} />
          ))}
          {pending && (
            <div className="flex items-center gap-2 px-2 text-sm text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" /> HerMind is thinking…
            </div>
          )}
        </div>
        <div className="h-28" />
      </div>

      <div className="fixed inset-x-0 bottom-20 z-20">
        <div className="mx-auto max-w-md px-4">
          <div className="flex items-end gap-2 rounded-3xl border border-border bg-card p-2 shadow-soft">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Type how you feel…"
              rows={1}
              className="max-h-32 flex-1 resize-none border-0 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
            />
            <Button
              onClick={send}
              disabled={!input.trim() || pending}
              size="icon"
              className="h-10 w-10 flex-none rounded-2xl"
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Bubble({ m }: { m: Msg }) {
  if (m.role === "USER") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-primary-foreground">
          {m.content}
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] space-y-2">
        {m.is_crisis && (
          <div className="flex items-center gap-1.5 text-xs font-medium text-destructive">
            <AlertTriangle className="h-3 w-3" /> Safety check
          </div>
        )}
        <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
          {m.content}
        </div>
      </div>
    </div>
  );
}
