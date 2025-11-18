import { useState } from "react";

interface LoginFormProps {
  onSubmit: (payload: { email: string; password: string }) => void;
  loading?: boolean;
  error?: string | null;
}

export function LoginForm({ onSubmit, loading, error }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-slate-700" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
          placeholder="you@university.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label
          className="text-sm font-medium text-slate-700"
          htmlFor="password"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </p>
      )}
      <button
        type="submit"
        className="w-full rounded-2xl bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:bg-slate-300"
        disabled={loading}
      >
        {loading ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
}
