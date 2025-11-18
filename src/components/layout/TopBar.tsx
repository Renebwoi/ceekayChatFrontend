import { Course } from "../../types/api";
import { LogOut, Menu, MessageSquare } from "lucide-react";

interface TopBarProps {
  selectedCourse?: Course | null;
  onLogout: () => void;
  onToggleSidebar: () => void;
}

export function TopBar({
  selectedCourse,
  onLogout,
  onToggleSidebar,
}: TopBarProps) {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-900 lg:hidden"
          onClick={onToggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="space-y-0.5">
          {selectedCourse ? (
            <>
              <p className="text-sm font-medium text-slate-500">
                {selectedCourse.code}
              </p>
              <h1 className="text-lg font-semibold text-slate-900">
                {selectedCourse.title}
              </h1>
            </>
          ) : (
            <div className="flex items-center gap-2 text-slate-500">
              <MessageSquare className="h-5 w-5" />
              <p>Select a course to view messages</p>
            </div>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={onLogout}
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </header>
  );
}
