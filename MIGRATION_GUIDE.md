# Frontend Migration Guide - Supabase to Custom API

## Overview

This guide helps migrate the frontend from Supabase to the custom NestJS backend API.

## Current State

The frontend uses:

- React 18+ with Vite
- Axios for HTTP requests
- Context API for state management
- TypeScript

## API Client Setup

### Axios Configuration

File: `src/lib/axios.ts`

```typescript
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined" && config.headers) {
    const token = window.localStorage.getItem("hermind_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export { api };
```

**Environment Variable:**

```
VITE_API_BASE_URL=http://localhost:3000
```

## API Modules

### Authentication API (`src/lib/auth-api.ts`)

```typescript
export interface AuthUser {
  id: string;
  email: string;
  profile?: AuthProfile;
}

export async function register(payload: RegisterPayload) {
  const { data } = await api.post<AuthResponse>("/auth/register", payload);
  return data;
}

export async function login(payload: LoginPayload) {
  const { data } = await api.post<AuthResponse>("/auth/login", payload);
  return data;
}

export async function me() {
  const { data } = await api.get<AuthUser>("/auth/me");
  return data;
}
```

### Mood API (`src/lib/mood-api.ts`)

```typescript
export async function createMoodEntry(payload: CreateMoodPayload) {
  const { data } = await api.post<MoodEntry>("/mood/entries", payload);
  return data;
}

export async function getMoodEntries(limit: number = 30) {
  const { data } = await api.get<MoodEntry[]>("/mood/entries", {
    params: { limit },
  });
  return data;
}

export async function getMoodStats(days: number = 7) {
  const { data } = await api.get<MoodStats>("/mood/stats", {
    params: { days },
  });
  return data;
}
```

### Journal API (`src/lib/journal-api.ts`)

```typescript
export async function createJournalEntry(payload: CreateJournalPayload) {
  const { data } = await api.post<JournalEntry>("/journal/entries", payload);
  return data;
}

export async function getJournalEntries(limit: number = 50) {
  const { data } = await api.get<JournalEntry[]>("/journal/entries", {
    params: { limit },
  });
  return data;
}

export async function searchJournalEntries(query: string) {
  const { data } = await api.get<JournalEntry[]>("/journal/entries/search", {
    params: { q: query },
  });
  return data;
}
```

### Chat API (`src/lib/chat-api.ts`)

```typescript
export async function createChatMessage(payload: CreateChatPayload) {
  const { data } = await api.post<ChatMessage>("/chat/messages", payload);
  return data;
}

export async function getChatHistory(limit: number = 50) {
  const { data } = await api.get<ChatMessage[]>("/chat/history", {
    params: { limit },
  });
  return data;
}
```

## Component Migration Examples

### Before (Supabase)

```typescript
import { useSupabaseClient } from "@supabase/auth-helpers-react";

function MoodTracker() {
  const supabase = useSupabaseClient();

  const handleSubmit = async (data) => {
    await supabase.from("mood_entries").insert([data]);
  };
}
```

### After (Custom API)

```typescript
import { moodApi } from "@/lib/mood-api";

function MoodTracker() {
  const handleSubmit = async (data) => {
    await moodApi.createMoodEntry(data);
  };
}
```

## State Management

### Auth Context (`src/lib/auth-context.tsx`)

```typescript
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = window.localStorage.getItem("hermind_token");
    if (!token) {
      setLoading(false);
      return;
    }

    authApi
      .me()
      .then((currentUser) => setUser(currentUser))
      .catch(() => {
        window.localStorage.removeItem("hermind_token");
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
          window.localStorage.setItem("hermind_token", token);
          setUser(userData || await authApi.me());
        },
        signOut: async () => {
          window.localStorage.removeItem("hermind_token");
          setUser(null);
        },
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
```

## Environment Variables

Create `.env` file in frontend directory:

```
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_NAME=Her Mind Safe Space
VITE_APP_VERSION=1.0.0
```

## Common Migration Patterns

### Database Insert → API POST

```typescript
// Before (Supabase)
await supabase.from("table").insert([data]);

// After (API)
await api.post("/endpoint", data);
```

### Database Select → API GET

```typescript
// Before (Supabase)
const { data } = await supabase.from("table").select();

// After (API)
const data = await api.get("/endpoint");
```

### Database Update → API PATCH

```typescript
// Before (Supabase)
await supabase.from("table").update(data).eq("id", id);

// After (API)
await api.patch(`/endpoint/${id}`, data);
```

### Database Delete → API DELETE

```typescript
// Before (Supabase)
await supabase.from("table").delete().eq("id", id);

// After (API)
await api.delete(`/endpoint/${id}`);
```

## File Structure

```
frontend/
├── src/
│   ├── lib/
│   │   ├── axios.ts              # Axios configuration
│   │   ├── auth-api.ts           # Auth endpoints
│   │   ├── mood-api.ts           # Mood endpoints
│   │   ├── journal-api.ts        # Journal endpoints
│   │   ├── chat-api.ts           # Chat endpoints
│   │   └── auth-context.tsx      # Auth provider
│   ├── routes/
│   │   ├── auth.tsx              # Auth pages
│   │   ├── index.tsx             # Home page
│   │   └── _app/
│   │       ├── mood.tsx          # Mood tracking
│   │       ├── journal.tsx       # Journal
│   │       ├── chat.tsx          # Chat
│   │       └── home.tsx          # Dashboard
│   ├── components/               # Reusable components
│   └── hooks/                    # Custom hooks
├── .env                          # Environment variables
└── vite.config.ts               # Vite configuration
```

## Error Handling

Add error handling to API calls:

```typescript
try {
  const result = await moodApi.createMoodEntry(data);
  console.log("Success:", result);
} catch (error) {
  if (error.response?.status === 401) {
    // Handle unauthorized
  } else if (error.response?.status === 400) {
    // Handle validation error
    console.error(error.response.data.message);
  }
}
```

## Testing Endpoints

### Using cURL

```bash
# Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "fullName": "John Doe",
    "age": 25
  }'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Create mood entry (with token)
curl -X POST http://localhost:3000/mood/entries \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "mood": "HAPPY",
    "intensity": 8
  }'
```

## Next Steps

1. Remove Supabase dependencies from package.json
2. Update all components to use API modules
3. Test authentication flow
4. Test all features with backend
5. Implement error handling and loading states
6. Add TypeScript types for all API responses
7. Set up proper environment configuration

## Troubleshooting

### CORS Errors

- Ensure backend has CORS enabled
- Check `CORS_ORIGIN` environment variable in backend

### Token Not Sent

- Check localStorage for `hermind_token`
- Verify axios interceptor is configured
- Check browser DevTools → Network tab

### 401 Unauthorized

- Token may have expired
- User needs to log in again
- Check JWT_SECRET matches between frontend and backend

### Connection Refused

- Ensure backend is running on correct port
- Check `VITE_API_BASE_URL` environment variable
