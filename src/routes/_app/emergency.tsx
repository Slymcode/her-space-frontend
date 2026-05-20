import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { emergencyApi } from "@/api/emergency";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/emergency")({
  component: EmergencyPage,
});

const HOTLINES = [
  { name: "Mentally Aware Nigeria (MANI)", phone: "08092106493", region: "Nigeria" },
  { name: "Befrienders Kenya", phone: "+254722178177", region: "Kenya" },
  { name: "SADAG", phone: "0800567567", region: "South Africa" },
  { name: "Mental Health Authority Ghana", phone: "0800678678", region: "Ghana" },
];

function EmergencyPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [relation, setRelation] = useState("");

  const { data: contacts = [] } = useQuery({
    queryKey: ["contacts", user?.id],
    enabled: !!user,
    queryFn: async () => {
      return await emergencyApi.getEmergencyContacts();
    },
  });

  const add = useMutation({
    mutationFn: async () => {
      if (!user || !name.trim() || !phone.trim()) throw new Error("Name and phone required");
      await emergencyApi.addEmergencyContact({
        name: name.trim(),
        phone: phone.trim(),
        relation: relation.trim() || undefined,
      });
    },
    onSuccess: () => {
      toast.success("Trusted contact added");
      setName("");
      setPhone("");
      setRelation("");
      qc.invalidateQueries({ queryKey: ["contacts"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      await emergencyApi.deleteEmergencyContact(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contacts"] }),
  });

  return (
    <div className="px-5 pt-10">
      <h1 className="text-2xl font-bold">You are not alone</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        If things feel really heavy, please reach out. Talking to a trusted person can help.
      </p>

      <h2 className="mt-7 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Helplines
      </h2>
      <div className="mt-2 space-y-2">
        {HOTLINES.map((h) => (
          <a
            key={h.phone}
            href={`tel:${h.phone}`}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warm text-warm-foreground">
              <Phone className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">{h.name}</p>
              <p className="text-xs text-muted-foreground">{h.region}</p>
            </div>
            <span className="text-sm font-medium text-primary">Call</span>
          </a>
        ))}
      </div>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Your trusted people
      </h2>
      <div className="mt-2 space-y-2">
        {contacts.map((c) => (
          <div
            key={c.id}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
          >
            <div className="flex-1">
              <p className="text-sm font-semibold">{c.name}</p>
              <p className="text-xs text-muted-foreground">
                {c.relation || "Trusted contact"}
              </p>
            </div>
            <a href={`tel:${c.phone}`} className="text-sm font-medium text-primary">
              Call
            </a>
            <button
              onClick={() => remove.mutate(c.id)}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2 rounded-2xl border border-dashed border-border p-4">
        <p className="text-sm font-medium">Add someone you trust</p>
        <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl" />
        <Input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-xl" />
        <Input
          placeholder="Relation (e.g. mum, aunt, teacher)"
          value={relation}
          onChange={(e) => setRelation(e.target.value)}
          className="rounded-xl"
        />
        <Button onClick={() => add.mutate()} disabled={add.isPending} className="w-full rounded-full">
          <Plus className="mr-1 h-4 w-4" /> Add contact
        </Button>
      </div>
    </div>
  );
}
