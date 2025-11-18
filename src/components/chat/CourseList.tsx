import { Course } from "../../types/api";

interface CourseListProps {
  courses: Course[];
  selectedCourseId?: string | null;
  onSelectCourse: (courseId: string) => void;
  isLoading?: boolean;
}

export function CourseList({
  courses,
  selectedCourseId,
  onSelectCourse,
  isLoading,
}: CourseListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-16 animate-pulse rounded-xl bg-slate-100"
          />
        ))}
      </div>
    );
  }

  if (!courses.length) {
    return (
      <p className="text-sm text-slate-500">
        You are not enrolled in any courses yet.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {courses.map((course) => {
        const isActive = course.id === selectedCourseId;
        return (
          <li key={course.id}>
            <button
              type="button"
              onClick={() => onSelectCourse(course.id)}
              className={`w-full rounded-2xl border px-4 py-3 text-left transition hover:border-slate-300 ${
                isActive
                  ? "border-slate-900 bg-slate-900 text-white shadow-lg"
                  : "border-slate-200 bg-white text-slate-900"
              }`}
            >
              <p className="text-sm font-semibold">{course.title}</p>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                {course.code}
              </p>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
