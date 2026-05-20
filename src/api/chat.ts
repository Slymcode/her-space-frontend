import { api } from "./axios";

export type ChatRole = "USER" | "ASSISTANT";
export type ChatType = "SUPPORT" | "EMERGENCY" | "GENERAL";

export interface ChatMessage {
  id: string;
  userId: string;
  role: ChatRole;
  content: string;
  type: ChatType;
  createdAt: string;
}

export interface CreateChatPayload {
  content: string;
  role: ChatRole;
  type?: ChatType;
}

export async function createChatMessage(payload: CreateChatPayload) {
  const { data } = await api.post<ChatMessage>("/chat/messages", payload);
  return data;
}

export async function getChatHistory(limit: number = 50, type?: ChatType) {
  const { data } = await api.get<ChatMessage[]>('/chat/history', {
    params: { limit, ...(type ? { type } : {}) },
  });
  return data;
}

export async function getLatestMessages(limit: number = 50) {
  const { data } = await api.get<ChatMessage[]>('/chat/latest', {
    params: { limit },
  });
  return data;
}

export async function getEmergencyMessages() {
  const { data } = await api.get<ChatMessage[]>('/chat/emergency');
  return data;
}

export async function deleteChatMessage(id: string) {
  await api.delete(`/chat/messages/${id}`);
}

export async function deleteChatHistory() {
  await api.delete('/chat/history');
}

export const chatApi = {
  createChatMessage,
  getChatHistory,
  getLatestMessages,
  getEmergencyMessages,
  deleteChatMessage,
  deleteChatHistory,
};
