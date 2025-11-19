import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import { adminApi } from "../api/adminApi";
import { AdminCourse, LecturerSummary, StudentSummary } from "../types/api";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { useAuth } from "../hooks/useAuth";

interface CourseFormState {
  code: string;
  title: string;
  lecturerId: string;
}

interface EnrollmentState {
  [courseId: string]: StudentSummary[];
}

export function AdminPage() {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState("courses");
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [lecturers, setLecturers] = useState<LecturerSummary[]>([]);
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentState>({});
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [courseForm, setCourseForm] = useState<CourseFormState>({
    code: "",
    title: "",
    lecturerId: "",
  });
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [studentActionLoading, setStudentActionLoading] = useState<
    string | null
  >(null);

  const resetFeedback = () => {
    setFeedback(null);
    setError(null);
  };

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  const extractErrorMessage = (err: unknown, fallback: string) => {
    if (isAxiosError(err)) {
      const data = err.response?.data as unknown;
      if (typeof data === "string") return data;
      if (Array.isArray(data)) {
        const first = data[0];
        if (typeof first === "string") return first;
      }
      if (data && typeof data === "object") {
        const candidate =
          (data as { message?: unknown }).message ??
          (data as { error?: unknown }).error ??
          (data as { detail?: unknown }).detail;
        if (typeof candidate === "string") {
          return candidate;
        }
      }
    } else if (err instanceof Error && err.message) {
      return err.message;
    }
    return fallback;
  };

  const normalizeCourse = (course: AdminCourse): AdminCourse => ({
    ...course,
    lecturer: course.lecturer ?? null,
    studentCount: course.studentCount ?? 0,
  });

  const normalizeStudent = (student: StudentSummary): StudentSummary => ({
    ...student,
    isBanned: student.isBanned ?? false,
  });

  const resolveList = <T,>(payload: unknown, key: string): T[] => {
    if (Array.isArray(payload)) {
      return payload as T[];
    }
    if (payload && typeof payload === "object") {
      const record = payload as Record<string, unknown>;
      const keyed = record[key];
      if (Array.isArray(keyed)) {
        return keyed as T[];
      }
      const firstArray = Object.values(record).find((value): value is T[] =>
        Array.isArray(value)
      );
      if (firstArray) {
        return firstArray;
      }
    }
    return [];
  };

  const resolveCourse = (payload: unknown): AdminCourse | null => {
    if (!payload) {
      return null;
    }
    if (Array.isArray(payload)) {
      return (payload.find(
        (item): item is AdminCourse =>
          item && typeof item === "object" && "id" in item
      ) ?? null) as AdminCourse | null;
    }
    if (typeof payload === "object") {
      const record = payload as Record<string, unknown>;
      if (record.course && typeof record.course === "object") {
        return record.course as AdminCourse;
      }
      if ("id" in record && "code" in record) {
        return record as unknown as AdminCourse;
      }
    }
    return null;
  };

  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    resetFeedback();
    try {
      const [coursesRes, lecturersRes, studentsRes] = await Promise.all([
        adminApi.getCourses(),
        adminApi.getLecturers(),
        adminApi.getStudents(),
      ]);
      setCourses(
        resolveList<AdminCourse>(coursesRes.data, "courses").map(
          normalizeCourse
        )
      );
      setLecturers(
        resolveList<LecturerSummary>(lecturersRes.data, "lecturers")
      );
      setStudents(
        resolveList<StudentSummary>(studentsRes.data, "students").map(
          normalizeStudent
        )
      );
    } catch (err) {
      console.error("Failed to load admin resources", err);
      setError("Unable to load admin data. Please refresh the page.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleCourseFormChange = (
    field: keyof CourseFormState,
    value: string
  ) => {
    setCourseForm((prev) => ({ ...prev, [field]: value }));
  };

  const refreshCourses = useCallback(async () => {
    try {
      const { data } = await adminApi.getCourses();
      setCourses(
        resolveList<AdminCourse>(data, "courses").map(normalizeCourse)
      );
    } catch (err) {
      console.error("Failed to refresh courses", err);
      setError(extractErrorMessage(err, "Unable to refresh courses."));
    }
  }, [extractErrorMessage]);

  const refreshEnrollments = useCallback(
    async (courseId: string) => {
      try {
        const { data } = await adminApi.getCourseStudents(courseId);
        const studentsList = Array.isArray(data?.students)
          ? data.students.map(normalizeStudent)
          : [];
        setEnrollments((prev) => ({ ...prev, [courseId]: studentsList }));
      } catch (err) {
        console.error("Failed to refresh enrollments", err);
        setError(extractErrorMessage(err, "Unable to refresh enrollments."));
      }
    },
    [extractErrorMessage]
  );

  const handleCreateCourse = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!courseForm.code.trim() || !courseForm.title.trim()) {
      setError("Course code and title are required.");
      return;
    }
    resetFeedback();
    setIsSubmitting(true);
    try {
      const payload = {
        code: courseForm.code.trim(),
        title: courseForm.title.trim(),
        lecturerId: courseForm.lecturerId || undefined,
      };
      const { data } = await adminApi.createCourse(payload);
      const createdCourse = resolveCourse(data);
      if (createdCourse) {
        setCourses((prev) => [normalizeCourse(createdCourse), ...prev]);
      } else {
        await refreshCourses();
      }
      setCourseForm({ code: "", title: "", lecturerId: "" });
      setFeedback("Course created successfully.");
    } catch (err) {
      console.error("Failed to create course", err);
      setError(
        extractErrorMessage(err, "Unable to create course. Please try again.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    resetFeedback();
    setStudentActionLoading(courseId);
    try {
      await adminApi.deleteCourse(courseId);
      setCourses((prev) => prev.filter((course) => course.id !== courseId));
      setEnrollments((prev) => {
        const next = { ...prev };
        delete next[courseId];
        return next;
      });
      if (selectedCourseId === courseId) {
        setSelectedCourseId(null);
      }
      setFeedback("Course deleted.");
    } catch (err) {
      console.error("Failed to delete course", err);
      setError(
        extractErrorMessage(err, "Unable to delete course. Please try again.")
      );
    } finally {
      setStudentActionLoading(null);
    }
  };

  const handleAssignLecturer = async (
    courseId: string,
    lecturerId: string | null
  ) => {
    resetFeedback();
    setStudentActionLoading(courseId);
    try {
      const { data } = await adminApi.assignLecturer(courseId, { lecturerId });
      if (data) {
        setCourses((prev) =>
          prev.map((course) =>
            course.id === courseId ? normalizeCourse(data) : course
          )
        );
      } else {
        await refreshCourses();
      }
      setFeedback("Lecturer assignment updated.");
    } catch (err) {
      console.error("Failed to assign lecturer", err);
      setError(
        extractErrorMessage(err, "Unable to assign lecturer. Please try again.")
      );
    } finally {
      setStudentActionLoading(null);
    }
  };

  const ensureEnrollmentLoaded = useCallback(
    async (courseId: string) => {
      if (enrollments[courseId]) {
        return;
      }
      setEnrollmentLoading(true);
      resetFeedback();
      try {
        await refreshEnrollments(courseId);
      } catch (err) {
        console.error("Failed to load enrollments", err);
        setError(
          extractErrorMessage(
            err,
            "Unable to load enrollments for this course."
          )
        );
      } finally {
        setEnrollmentLoading(false);
      }
    },
    [enrollments, extractErrorMessage, refreshEnrollments]
  );

  const handleSelectCourse = async (courseId: string) => {
    setSelectedCourseId(courseId);
    await ensureEnrollmentLoaded(courseId);
  };

  const handleEnrollStudent = async (courseId: string, studentId: string) => {
    if (!studentId) return;
    resetFeedback();
    setStudentActionLoading(`${courseId}-${studentId}`);
    try {
      await adminApi.enrollStudent(courseId, { studentId });
      await refreshEnrollments(courseId);
      setFeedback("Student enrolled in course.");
    } catch (err) {
      console.error("Failed to enroll student", err);
      setError(
        extractErrorMessage(err, "Unable to enroll student. Please try again.")
      );
    } finally {
      setStudentActionLoading(null);
    }
  };

  const handleUnenrollStudent = async (courseId: string, studentId: string) => {
    resetFeedback();
    setStudentActionLoading(`${courseId}-${studentId}`);
    try {
      await adminApi.unenrollStudent(courseId, studentId);
      await refreshEnrollments(courseId);
      setFeedback("Student unenrolled from course.");
    } catch (err) {
      console.error("Failed to unenroll student", err);
      setError(
        extractErrorMessage(
          err,
          "Unable to unenroll student. Please try again."
        )
      );
    } finally {
      setStudentActionLoading(null);
    }
  };

  const handleBanToggle = async (studentId: string, shouldBan: boolean) => {
    resetFeedback();
    setStudentActionLoading(studentId);
    try {
      const response = shouldBan
        ? await adminApi.banStudent(studentId)
        : await adminApi.unbanStudent(studentId);
      const updated = normalizeStudent(response.data);
      setStudents((prev) =>
        prev.map((student) =>
          student.id === studentId
            ? { ...student, isBanned: updated.isBanned }
            : student
        )
      );
      setEnrollments((prev) => {
        const next: EnrollmentState = {};
        Object.entries(prev).forEach(([courseId, list]) => {
          next[courseId] = list.map((student) =>
            student.id === studentId
              ? { ...student, isBanned: updated.isBanned }
              : student
          );
        });
        return next;
      });
      setFeedback(shouldBan ? "Student banned." : "Student unbanned.");
    } catch (err) {
      console.error("Failed to toggle ban", err);
      setError(
        extractErrorMessage(
          err,
          "Unable to update student status. Please try again."
        )
      );
    } finally {
      setStudentActionLoading(null);
    }
  };

  const selectedEnrollment = selectedCourseId
    ? enrollments[selectedCourseId] ?? []
    : [];

  const availableStudentsForCourse = useMemo(() => {
    if (!selectedCourseId) return [];
    const selectedIds = new Set(
      (selectedEnrollment ?? []).map((student) => student.id)
    );
    return students.filter(
      (student) => !selectedIds.has(student.id) && !student.isBanned
    );
  }, [selectedCourseId, selectedEnrollment, students]);

  const renderFeedback = () => {
    if (!feedback && !error) return null;
    return (
      <div
        className={`rounded-xl border px-4 py-3 text-sm ${
          error
            ? "border-red-200 bg-red-50 text-red-700"
            : "border-emerald-200 bg-emerald-50 text-emerald-700"
        }`}
      >
        {error ?? feedback}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Admin Dashboard
            </p>
            <h1 className="text-2xl font-semibold text-slate-900">
              Manage courses, enrollments, and student access
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={fetchInitialData}
              disabled={isLoading}
            >
              {isLoading ? "Refreshing…" : "Refresh data"}
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-8">
        {renderFeedback()}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
              <Card>
                <CardHeader>
                  <CardTitle>Create course</CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4" onSubmit={handleCreateCourse}>
                    <div className="space-y-2">
                      <label
                        className="text-sm font-medium text-slate-700"
                        htmlFor="course-code"
                      >
                        Course code
                      </label>
                      <Input
                        id="course-code"
                        value={courseForm.code}
                        onChange={(event) =>
                          handleCourseFormChange("code", event.target.value)
                        }
                        placeholder="e.g. CS101"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        className="text-sm font-medium text-slate-700"
                        htmlFor="course-title"
                      >
                        Course title
                      </label>
                      <Input
                        id="course-title"
                        value={courseForm.title}
                        onChange={(event) =>
                          handleCourseFormChange("title", event.target.value)
                        }
                        placeholder="Introduction to Computer Science"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        className="text-sm font-medium text-slate-700"
                        htmlFor="course-lecturer"
                      >
                        Lecturer (optional)
                      </label>
                      <select
                        id="course-lecturer"
                        className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                        value={courseForm.lecturerId}
                        onChange={(event) =>
                          handleCourseFormChange(
                            "lecturerId",
                            event.target.value
                          )
                        }
                      >
                        <option value="">No lecturer</option>
                        {lecturers.map((lecturer) => (
                          <option key={lecturer.id} value={lecturer.id}>
                            {lecturer.name} ({lecturer.email})
                          </option>
                        ))}
                      </select>
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Creating…" : "Add course"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle>Courses</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {courses.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      No courses created yet.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {courses.map((course) => (
                        <div
                          key={course.id}
                          className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
                        >
                          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">
                                {course.title}
                              </p>
                              <p className="text-xs uppercase tracking-wide text-slate-500">
                                {course.code}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {course.lecturer
                                  ? `Lecturer: ${course.lecturer.name}`
                                  : "No lecturer assigned"}
                              </p>
                              <p className="text-xs text-slate-500">
                                {course.studentCount ?? 0} enrolled students
                              </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <select
                                className="rounded-md border border-slate-200 px-2 py-2 text-sm"
                                value={course.lecturer?.id ?? ""}
                                onChange={(event) =>
                                  handleAssignLecturer(
                                    course.id,
                                    event.target.value
                                      ? event.target.value
                                      : null
                                  )
                                }
                                disabled={studentActionLoading === course.id}
                              >
                                <option value="">No lecturer</option>
                                {lecturers.map((lecturer) => (
                                  <option key={lecturer.id} value={lecturer.id}>
                                    {lecturer.name}
                                  </option>
                                ))}
                              </select>
                              <Button
                                variant="outline"
                                className="border-red-200 text-red-600 hover:bg-red-50"
                                onClick={() => handleDeleteCourse(course.id)}
                                disabled={studentActionLoading === course.id}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="enrollments" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
              <Card>
                <CardHeader>
                  <CardTitle>Courses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {courses.length === 0 && (
                      <p className="text-sm text-slate-500">
                        Create a course to manage enrollments.
                      </p>
                    )}
                    {courses.map((course) => {
                      const isActive = course.id === selectedCourseId;
                      return (
                        <button
                          type="button"
                          key={course.id}
                          onClick={() => handleSelectCourse(course.id)}
                          className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                            isActive
                              ? "border-slate-900 bg-slate-900 text-white"
                              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                          }`}
                        >
                          <span className="font-medium">{course.title}</span>
                          <span className="block text-xs uppercase tracking-wide text-slate-400">
                            {course.code}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle>Enrollment details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {!selectedCourseId ? (
                    <p className="text-sm text-slate-500">
                      Select a course to manage enrollments.
                    </p>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-end gap-3">
                        <div className="flex-1 min-w-[200px]">
                          <label
                            className="text-sm font-medium text-slate-700"
                            htmlFor="enrollment-student"
                          >
                            Add student
                          </label>
                          <select
                            id="enrollment-student"
                            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                            onChange={(event) => {
                              if (event.target.value) {
                                handleEnrollStudent(
                                  selectedCourseId,
                                  event.target.value
                                );
                                event.target.value = "";
                              }
                            }}
                            disabled={
                              enrollmentLoading ||
                              availableStudentsForCourse.length === 0
                            }
                          >
                            <option value="">
                              {availableStudentsForCourse.length === 0
                                ? "No available students"
                                : "Select student"}
                            </option>
                            {availableStudentsForCourse.map((student) => (
                              <option key={student.id} value={student.id}>
                                {student.name} ({student.email})
                              </option>
                            ))}
                          </select>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() =>
                            ensureEnrollmentLoaded(selectedCourseId)
                          }
                          disabled={enrollmentLoading}
                        >
                          {enrollmentLoading ? "Loading…" : "Refresh list"}
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {selectedEnrollment.length === 0 ? (
                          <p className="text-sm text-slate-500">
                            No students enrolled yet.
                          </p>
                        ) : (
                          selectedEnrollment.map((student) => {
                            const actionKey = `${selectedCourseId}-${student.id}`;
                            return (
                              <div
                                key={student.id}
                                className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm md:flex-row md:items-center md:justify-between"
                              >
                                <div>
                                  <p className="font-medium text-slate-900">
                                    {student.name}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {student.email}
                                  </p>
                                  {student.isBanned && (
                                    <p className="text-xs font-semibold text-red-600">
                                      Banned
                                    </p>
                                  )}
                                </div>
                                <Button
                                  variant="outline"
                                  onClick={() =>
                                    handleUnenrollStudent(
                                      selectedCourseId,
                                      student.id
                                    )
                                  }
                                  disabled={studentActionLoading === actionKey}
                                >
                                  Remove
                                </Button>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Students</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {students.length === 0 ? (
                  <p className="text-sm text-slate-500">No students found.</p>
                ) : (
                  students.map((student) => (
                    <div
                      key={student.id}
                      className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="font-medium text-slate-900">
                          {student.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {student.email}
                        </p>
                        {student.isBanned ? (
                          <p className="text-xs font-semibold text-red-600">
                            Banned
                          </p>
                        ) : (
                          <p className="text-xs text-slate-500">Active</p>
                        )}
                      </div>
                      <Button
                        variant={student.isBanned ? "outline" : "destructive"}
                        onClick={() =>
                          handleBanToggle(student.id, !student.isBanned)
                        }
                        disabled={studentActionLoading === student.id}
                      >
                        {student.isBanned ? "Unban" : "Ban"}
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
