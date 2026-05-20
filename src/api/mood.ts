import { api } from "./axios";

export interface OrchestrationResult {
  analysis: {
    emotion: string;
    severity: string;
    isCrisis: boolean;
    safeOverrideResponse?: string;
  };
  recommendations: string[];
  aiResponse: string;
  isCrisis: boolean;
}

export interface MoodEntry {
  id: string;
  userId: string;
  mood: string;
  score: number;
  note?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MoodEntryResponse {
  entry: MoodEntry;
  orchestration?: OrchestrationResult | null;
}

export interface MoodStats {
  totalEntries: number;
  averageIntensity: number;
  moodCounts: Record<string, number>;
  entries: MoodEntry[];
}

export interface CreateMoodPayload {
  mood: string;
  score: number;
  note?: string | null;
}

export async function getMoodEntries(limit: number = 30) {
  const { data } = await api.get<MoodEntry[]>("/mood/entries", {
    params: { limit },
  });
  return data;
}

export async function createMoodEntry(payload: CreateMoodPayload) {
  const { data } = await api.post<MoodEntryResponse>("/mood/entries", payload);
  return data;
}

export async function deleteMoodEntry(id: string) {
  await api.delete(`/mood/entries/${id}`);
}

export async function getMoodStats(days: number = 7) {
  const { data } = await api.get<MoodStats>(`/mood/stats`, { params: { days } });
  return data;
}

export const moodApi = {
  getMoodEntries,
  createMoodEntry,
  deleteMoodEntry,
  getMoodStats,
};
