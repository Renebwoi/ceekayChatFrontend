import axios from "axios";

// Resolve the API base URL from Vite envs, defaulting to the local backend for dev.
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

// Shared Axios instance so every API helper inherits consistent settings.
const axiosClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: false,
});

// Inject the JWT on every request when the browser has an active session.
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("chatroomx_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize auth failures so the UI can force logout or display targeted messaging.
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 403 || status === 401) {
      const rawData = error?.response?.data;
      const normalizedMessage = extractErrorMessage(rawData);
      const isBanned =
        typeof normalizedMessage === "string" &&
        /bann/i.test(normalizedMessage);
      if (status === 403 && !isBanned) {
        const code = extractErrorMessage(
          (rawData as { code?: unknown; errorCode?: unknown })?.code ??
            (rawData as { errorCode?: unknown })?.errorCode ??
            (rawData as { error?: unknown })?.error
        );
        if (typeof code === "string" && /bann/i.test(code)) {
          handleForcedLogout("banned");
          return Promise.reject(error);
        }
      }
      if (isBanned) {
        handleForcedLogout("banned");
      } else if (status === 403) {
        handleForcedLogout("access-denied");
      }
    }
    return Promise.reject(error);
  }
);

function extractErrorMessage(input: unknown): string | null {
  if (!input) return null;
  if (typeof input === "string") {
    return input;
  }
  if (Array.isArray(input)) {
    const first = input[0];
    return typeof first === "string" ? first : null;
  }
  if (typeof input === "object") {
    const candidate =
      (input as { message?: unknown }).message ??
      (input as { error?: unknown }).error ??
      (input as { code?: unknown }).code ??
      (input as { errorCode?: unknown }).errorCode ??
      (input as { reason?: unknown }).reason;
    return typeof candidate === "string" ? candidate : null;
  }
  return null;
}

// Clear session state and redirect so the user sees the relevant auth banner.
function handleForcedLogout(status: "banned" | "access-denied") {
  localStorage.removeItem("chatroomx_token");
  localStorage.removeItem("chatroomx_user");
  if (typeof window !== "undefined") {
    const params = new URLSearchParams();
    params.set("status", status);
    const query = params.toString();
    const redirectUrl = `/login?${query}`;
    if (
      window.location.pathname !== "/login" ||
      window.location.search !== `?${query}`
    ) {
      window.location.replace(redirectUrl);
    }
  }
}

export default axiosClient;
