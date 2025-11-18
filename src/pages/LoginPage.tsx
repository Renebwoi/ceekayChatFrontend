import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { LoginForm } from "../components/auth/LoginForm";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (payload: { email: string; password: string }) => {
    try {
      setLoading(true);
      setError(null);
      await login(payload);
      navigate("/chat");
    } catch (err) {
      setError("Unable to sign in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
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
