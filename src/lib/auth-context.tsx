import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authApi, type AuthUser } from "@/api/auth";
import { getToken, removeToken, setToken } from "@/services/token-service";

interface AuthCtx {
  user: AuthUser | null;
  loading: boolean;
  signIn: (token: string, user?: AuthUser) => Promise<void>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }

    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    authApi
      .me()
      .then((currentUser: AuthUser) => setUser(currentUser))
      .catch(() => {
        removeToken();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Ctx.Provider
      value={{
        user,
        loading,
        signIn: async (token: string, userData?: AuthUser) => {
          setToken(token);
          if (userData) {
            setUser(userData);
            return;
          }
          const currentUser = await authApi.me();
          setUser(currentUser);
        },
        signOut: async () => {
          removeToken();
          setUser(null);
        },
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
