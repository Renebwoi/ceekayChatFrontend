import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RegisterForm } from "../components/auth/RegisterForm";
import { useAuth } from "../hooks/useAuth";
import { RegisterPayload } from "../types/api";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (payload: RegisterPayload) => {
    try {
      setLoading(true);
      setError(null);
      await register(payload);
      navigate("/chat");
    } catch {
      setError("Unable to create your account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 lg:flex-row">
      <div className="hidden flex-1 items-center justify-center bg-slate-900 p-10 text-white lg:flex">
        <div className="max-w-md space-y-4">
          <p className="text-sm uppercase tracking-wide text-slate-300">
            Course-first communication
          </p>
          <h2 className="text-3xl font-semibold">
            Create channels per course and keep discussions organized.
          </h2>
          <p className="text-slate-300">
            Bring together announcements, file sharing, and real-time chat in
            one space.
          </p>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Get started
            </p>
            <h1 className="text-3xl font-semibold text-slate-900">
              Create your ChatRoomX account
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Choose your role, invite students, and kick off live discussions.
            </p>
          </div>
          <RegisterForm
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
          />
          <p className="text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-slate-900">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
