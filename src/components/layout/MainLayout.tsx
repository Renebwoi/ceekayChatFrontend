import { ReactNode, useState } from "react";
import { Course, User } from "../../types/api";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

interface MainLayoutProps {
  user: User;
  courses: Course[];
  selectedCourseId?: string | null;
  onSelectCourse: (courseId: string) => void;
  onLogout: () => void;
  selectedCourse?: Course | null;
  courseLoading?: boolean;
  children: ReactNode;
}

export function MainLayout({
  user,
  courses,
  selectedCourseId,
  onSelectCourse,
  onLogout,
  selectedCourse,
  courseLoading,
  children,
}: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex h-screen">
        <Sidebar
          user={user}
          courses={courses}
          selectedCourseId={selectedCourseId}
          onSelectCourse={(id) => {
            onSelectCourse(id);
            setIsSidebarOpen(false);
          }}
          isLoading={courseLoading}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
          <TopBar
            selectedCourse={selectedCourse}
            onLogout={onLogout}
            onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          />
          <main className="flex-1 min-h-0 overflow-hidden">{children}</main>
        </div>
      </div>
    </div>
  );
}
