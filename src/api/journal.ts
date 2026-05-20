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

export interface JournalEntry {
  id: string;
  userId: string;
  title?: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface JournalEntryResponse {
  entry: JournalEntry;
  orchestration?: OrchestrationResult | null;
}

export interface CreateJournalPayload {
  title?: string | null;
  content: string;
}

export async function getJournalEntries() {
  const { data } = await api.get<JournalEntry[]>('/journal/entries');
  return data;
}

export async function createJournalEntry(payload: CreateJournalPayload) {
  const { data } = await api.post<JournalEntryResponse>('/journal/entries', payload);
  return data;
}

export async function deleteJournalEntry(id: string) {
  await api.delete(`/journal/entries/${id}`);
}

export const journalApi = {
  getJournalEntries,
  createJournalEntry,
  deleteJournalEntry,
};
