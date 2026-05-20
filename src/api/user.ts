import { api } from "./axios";

export type Profile = {
  fullName?: string;
  age?: number;
  pronouns?: string;
  country?: string;
  preferredLanguage?: string;
  emotionalGoals?: string[];
  stressTriggers?: string[];
  onboarded?: boolean;
};

export async function getProfile() {
  const { data } = await api.get<{ profile?: Profile } | Profile>("/users/profile");
  return ((data as { profile?: Profile }).profile ?? data) as Profile;
}

export async function updateProfile(payload: Partial<Profile>) {
  const { data } = await api.patch<Profile>("/users/profile", payload);
  return data;
}

export const userApi = {
  getProfile,
  updateProfile,
};
