import client from "./client";
import type { ApiResponse } from "../types";

interface AuthTokens {
  access: string;
  refresh: string;
}

export async function login(username: string, password: string): Promise<AuthTokens> {
  const { data } = await client.post<ApiResponse<AuthTokens>>("/api/auth/login/", {
    username,
    password,
  });
  return data.data!;
}
