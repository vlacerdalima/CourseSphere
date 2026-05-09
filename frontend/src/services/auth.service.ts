import api from "./api";
import type { AuthResponse, User, UpdateProfileData } from "@/types";

export async function loginService(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/login", { email, password });
  return data;
}

export async function registerService(name: string, email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/register", { name, email, password });
  return data;
}

export async function updateProfileService(data: UpdateProfileData): Promise<User> {
  const { data: user } = await api.patch<{ user: User }>("/auth/profile", data);
  return user.user;
}
