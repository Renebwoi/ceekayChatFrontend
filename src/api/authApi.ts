import axiosClient from "./axiosClient";
import { AuthResponse, LoginPayload, RegisterPayload } from "../types/api";

export const authApi = {
  login(payload: LoginPayload) {
    return axiosClient.post<AuthResponse>("/api/auth/login", payload);
  },
  register(payload: RegisterPayload) {
    return axiosClient.post<AuthResponse>("/api/auth/register", payload);
  },
};
