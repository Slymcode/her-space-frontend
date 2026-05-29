import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { z } from "zod";
import { authApi } from "@/api/auth";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";

const searchSchema = z.object({
  mode: z.enum(["login", "signup"]).catch("signup"),
});

const COUNTRIES = [
  "Nigeria",
  "Kenya",
  "Ghana",
  "South Africa",
  "Uganda",
  "Tanzania",
  "Rwanda",
  "Ethiopia",
  "Senegal",
  "Cameroon",
  "Zimbabwe",
  "Zambia",
  "Mozambique",
  "Malawi",
  "Sierra Leone",
  "Botswana",
  "Namibia",
  "Ivory Coast",
  "Burkina Faso",
  "Sudan",
  "Algeria",
  "Morocco",
  "Egypt",
  "Tunisia",
  "Libya",
  "Mali",
  "Benin",
  "Mauritius",
  "Madagascar",
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "sw", label: "Kiswahili" },
  { value: "fr", label: "Français" },
  { value: "pt", label: "Português" },
  { value: "ar", label: "العربية" },
  { value: "ha", label: "Hausa" },
  { value: "yo", label: "Yorùbá" },
  { value: "am", label: "Amharic" },
];

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  component: AuthPage,
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const { user, loading: authLoading, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("19");
  const [country, setCountry] = useState("Nigeria");
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) navigate({ to: "/home" });
  }, [user, authLoading, navigate]);

  const isSignup = mode === "signup";

  function getAuthErrorMessage(error: unknown) {
    if (error instanceof AxiosError) {
      const response = error.response?.data as
        | { message?: string | string[]; error?: string }
        | undefined;
      if (response?.message) {
        return Array.isArray(response.message) ? response.message.join(" ") : response.message;
      }
      if (response?.error) {
        return response.error;
      }
      if (error.response?.status === 401) {
        return "Invalid email or password.";
      }
      return error.message;
    }

    return error instanceof Error ? error.message : "Something went wrong";
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignup) {
        const ageNum = parseInt(age, 10);
        if (!ageNum || ageNum < 10 || ageNum > 19) {
          toast.error("HerSpace is for girls aged 10–19.");
          return;
        }
        if (!country) {
          toast.error("Please choose your country.");
          return;
        }
        if (!language) {
          toast.error("Please choose your preferred language.");
          return;
        }
        if (password.length < 6) {
          toast.error("Password must be at least 6 characters.");
          return;
        }

        const data = await authApi.register({
          email,
          password,
          fullName: name,
          age: ageNum,
          country,
          preferredLanguage: language,
        });

        await signIn(data.accessToken, data.user);
        toast.success("Welcome to HerSpace! 💛");
        navigate({ to: "/home" });
      } else {
        const data = await authApi.login({ email, password });
        await signIn(data.accessToken, data.user);
        toast.success("Welcome back!");
        navigate({ to: "/home" });
      }
    } catch (err) {
      toast.error(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 pb-8 pt-10">
        <button
          onClick={() => navigate({ to: "/" })}
          className="flex items-center gap-2 self-start"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Heart className="h-4 w-4" fill="currentColor" />
          </div>
          <span className="font-semibold">HerSpace</span>
        </button>

        <div className="mt-10">
          <h1 className="text-3xl font-bold">{isSignup ? "Create your space" : "Welcome back"}</h1>
          <p className="mt-2 text-muted-foreground">
            {isSignup
              ? "A few details to keep things personal and safe."
              : "We're glad you're here."}
          </p>
        </div>

        <form onSubmit={submit} className="mt-8 space-y-4">
          {isSignup && (
            <>
              <div>
                <Label htmlFor="name">First name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1.5 rounded-xl"
                />
              </div>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="age">Your age</Label>
                  <select
                    id="age"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    required
                    className="mt-1.5 h-12 w-full rounded-xl border border-input bg-background px-3 text-sm"
                  >
                    <option value="">Select your age</option>
                    {Array.from({ length: 10 }, (_, index) => {
                      const value = 10 + index;
                      return (
                        <option key={value} value={String(value)}>
                          {value}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <Label htmlFor="country">Country</Label>
                  <select
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    required
                    className="mt-1.5 h-12 w-full rounded-xl border border-input bg-background px-3 text-sm"
                  >
                    <option value="">Select your country</option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="language">Preferred language</Label>
                  <select
                    id="language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    required
                    className="mt-1.5 h-12 w-full rounded-xl border border-input bg-background px-3 text-sm"
                  >
                    <option value="">Select your language</option>
                    {LANGUAGES.map((lang) => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1.5 rounded-xl"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="mt-1.5 rounded-xl"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            size="lg"
            className="mt-2 w-full rounded-full text-base"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSignup ? "Create account" : "Sign in"}
          </Button>
        </form>

        <button
          onClick={() => navigate({ to: "/auth", search: { mode: isSignup ? "login" : "signup" } })}
          className="mt-6 text-center text-sm text-muted-foreground hover:text-foreground"
        >
          {isSignup ? "Already have an account? Sign in" : "New here? Create an account"}
        </button>
      </div>
    </div>
  );
}
