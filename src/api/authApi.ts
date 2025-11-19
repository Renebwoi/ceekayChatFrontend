import axiosClient from "./axiosClient";
import { AuthResponse, LoginPayload, RegisterPayload } from "../types/api";

export const authApi = {
  // Exchange credentials for an auth token and user profile.
  login(payload: LoginPayload) {
    return axiosClient.post<AuthResponse>("/api/auth/login", payload);
  },
  // Create a new account and receive the same auth payload as login.
  register(payload: RegisterPayload) {
    return axiosClient.post<AuthResponse>("/api/auth/register", payload);
  },
};
