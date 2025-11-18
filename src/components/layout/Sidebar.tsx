import { Course, User } from "../../types/api";
import { CourseList } from "../chat/CourseList";

interface SidebarProps {
  user: User;
  courses: Course[];
  selectedCourseId?: string | null;
  onSelectCourse: (courseId: string) => void;
  isLoading?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({
  user,
  courses,
  selectedCourseId,
  onSelectCourse,
  isLoading,
  isOpen,
  onClose,
}: SidebarProps) {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed inset-y-0 z-40 w-72 transform bg-white shadow-xl transition-transform lg:relative lg:block lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full border-r border-slate-200">
          <div className="border-b border-slate-200 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Logged in as
            </p>
            <p className="text-lg font-semibold text-slate-900">{user.name}</p>
            <p className="text-sm text-slate-500">{user.email}</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              My Courses
            </h2>
            <CourseList
              courses={courses}
              isLoading={isLoading}
              onSelectCourse={onSelectCourse}
              selectedCourseId={selectedCourseId}
            />
          </div>
        </div>
      </aside>
    </>
  );
}
