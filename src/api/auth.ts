import { api } from "./axios";

export interface AuthProfile {
  firstName?: string;
  lastName?: string;
  age?: number;
  country?: string;
  preferredLanguage?: string;
  pronouns?: string;
  onboarded?: boolean;
  emotionalGoals?: string[];
  stressTriggers?: string[];
}

export interface AuthUser {
  id: string;
  email: string;
  profile?: AuthProfile;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  age: number;
  country: string;
  preferredLanguage: string;
}

export interface LoginPayload {
  email: string;
  password: string;
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

export const authApi = {
  register,
  login,
  me,
};
