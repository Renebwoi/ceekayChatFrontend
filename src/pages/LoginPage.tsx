import { isAxiosError } from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { LoginForm } from "../components/auth/LoginForm";
import { UserRole } from "../types/api";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get("status");
    if (status === "banned") {
      setError(
        "Your account has been banned. Contact your administrator for assistance."
      );
      params.delete("status");
      window.history.replaceState(null, "", location.pathname);
    } else if (status === "access-denied") {
      setError("Access denied. Please sign in again to continue.");
      params.delete("status");
      window.history.replaceState(null, "", location.pathname);
    }
  }, [location.pathname, location.search]);

  const resolveRedirect = (role: UserRole) => {
    return role === "ADMIN" ? "/admin" : "/chat";
  };

  const handleSubmit = async (payload: { email: string; password: string }) => {
    try {
      setLoading(true);
      setError(null);
      const authenticatedUser = await login(payload);
      navigate(resolveRedirect(authenticatedUser.role), { replace: true });
    } catch (err) {
      setError(parseLoginError(err));
    } finally {
      setLoading(false);
    }
  };

  const parseLoginError = (err: unknown) => {
    const fallback = "Unable to sign in. Please check your credentials.";
    if (isAxiosError(err)) {
      const status = err.response?.status;
      const data = err.response?.data as unknown;
      const possibleMessage = extractMessage(data);

      if (status === 403) {
        if (possibleMessage && /bann/i.test(possibleMessage)) {
          return "Your account has been banned. Contact your administrator for assistance.";
        }
        return (
          possibleMessage || "Access denied. Please contact your administrator."
        );
      }

      if (possibleMessage) {
        return possibleMessage;
      }
    } else if (err instanceof Error && err.message) {
      return err.message;
    }
    return fallback;
  };

  const extractMessage = (data: unknown): string | null => {
    if (!data) return null;
    if (typeof data === "string") return data;
    if (Array.isArray(data)) {
      const first = data[0];
      return typeof first === "string" ? first : null;
    }
    if (typeof data === "object") {
      const value =
        (data as { message?: unknown }).message ??
        (data as { error?: unknown }).error ??
        (data as { code?: unknown }).code ??
        (data as { errorCode?: unknown }).errorCode;
      if (typeof value === "string") {
        return value;
      }
    }
    return null;
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 lg:flex-row">
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Welcome back
            </p>
            <h1 className="text-3xl font-semibold text-slate-900">
              Sign in to ChatRoomX
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Continue your courses and stay up to date with real-time
              discussions.
            </p>
          </div>
          <LoginForm onSubmit={handleSubmit} loading={loading} error={error} />
          <p className="text-center text-sm text-slate-500">
            Don’t have an account?{" "}
            <Link to="/register" className="font-semibold text-slate-900">
              Create one
            </Link>
          </p>
        </div>
      </div>
      <div className="hidden flex-1 items-center justify-center bg-slate-900 p-10 text-white lg:flex">
        <div className="max-w-md space-y-4">
          <p className="text-sm uppercase tracking-wide text-slate-300">
            Real-time collaboration
          </p>
          <h2 className="text-3xl font-semibold">
            Discuss course content with your peers instantly.
          </h2>
          <p className="text-slate-300">
            Join structured course channels, share files, and keep everyone
            aligned with built-in real-time messaging.
          </p>
        </div>
      </div>
    </div>
  );
}
