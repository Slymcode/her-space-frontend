import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { getProfile } from "@/api/user";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export const Route = createFileRoute("/_app/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: getProfile,
  });

  return (
    <div className="px-5 pt-10">
      <h1 className="text-2xl font-bold">Profile</h1>

      <div className="mt-6 flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
          {profile?.full_name?.[0]?.toUpperCase() || "💛"}
        </div>
        <div>
          <p className="font-semibold">{profile?.full_name || "You"}</p>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          {profile?.age && <p className="text-xs text-muted-foreground">Age {profile.age}</p>}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-4">
        <p className="text-sm font-semibold">About HerMind</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          HerMind offers warm emotional support — it is not a therapist or doctor. If something
          feels urgent or unsafe, please reach a trusted adult or a helpline from the Help tab.
        </p>
      </div>

      <Button
        variant="outline"
        size="lg"
        onClick={async () => {
          await signOut();
          navigate({ to: "/" });
        }}
        className="mt-6 w-full rounded-full"
      >
        <LogOut className="mr-2 h-4 w-4" /> Sign out
      </Button>
    </div>
  );
}
