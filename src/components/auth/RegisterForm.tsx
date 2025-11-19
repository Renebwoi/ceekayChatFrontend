import { useState } from "react";
import { NonAdminUserRole } from "../../types/api";

interface RegisterFormProps {
  onSubmit: (payload: {
    name: string;
    email: string;
    password: string;
    role: NonAdminUserRole;
  }) => void;
  loading?: boolean;
  error?: string | null;
}

const roles: NonAdminUserRole[] = ["STUDENT", "LECTURER"];

export function RegisterForm({ onSubmit, loading, error }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "STUDENT" as NonAdminUserRole,
  });

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-slate-700" htmlFor="name">
          Full Name
        </label>
        <input
          id="name"
          required
          className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
          placeholder="Jane Doe"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
        />
      </div>
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
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
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
          value={formData.password}
          onChange={(e) => handleChange("password", e.target.value)}
        />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700" htmlFor="role">
          Role
        </label>
        <select
          id="role"
          className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
          value={formData.role}
          onChange={(e) => handleChange("role", e.target.value)}
        >
          {roles.map((role) => (
            <option key={role} value={role}>
              {role === "STUDENT" ? "Student" : "Lecturer"}
            </option>
          ))}
        </select>
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
        {loading ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
