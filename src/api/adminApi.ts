import axiosClient from "./axiosClient";
import {
  AdminCourse,
  CourseEnrollment,
  CourseEnrollmentSummary,
  LecturerSummary,
  StudentSummary,
} from "../types/api";

// Payload describing the data needed to create a new course record.
export interface CreateCoursePayload {
  code: string;
  title: string;
  lecturerId?: string;
}

// Payload for updating which lecturer owns a course; null removes the assignment.
export interface AssignLecturerPayload {
  lecturerId: string | null;
}

// Minimal payload required to enroll a student into a course.
export interface EnrollmentPayload {
  studentId: string;
}

export const adminApi = {
  // Fetch the admin-facing course list including metadata like lecturer assignments.
  getCourses() {
    return axiosClient.get<AdminCourse[]>("/api/admin/courses");
  },
  // Create a new course entry, returning either the entity or a wrapper depending on backend response.
  createCourse(payload: CreateCoursePayload) {
    return axiosClient.post<AdminCourse | { course: AdminCourse }>(
      "/api/admin/courses",
      payload
    );
  },
  // Permanently remove a course from the catalog.
  deleteCourse(courseId: string) {
    return axiosClient.delete<void>(`/api/admin/courses/${courseId}`);
  },
  // Assign or clear a lecturer for the specified course.
  assignLecturer(courseId: string, payload: AssignLecturerPayload) {
    return axiosClient.patch<AdminCourse>(
      `/api/admin/courses/${courseId}/lecturer`,
      payload
    );
  },
  // Retrieve all lecturers to populate admin dropdowns and summaries.
  getLecturers() {
    return axiosClient.get<LecturerSummary[]>("/api/admin/lecturers");
  },
  // Fetch every student, including ban status and department info.
  getStudents() {
    return axiosClient.get<StudentSummary[]>("/api/admin/students");
  },
  // Load the roster of students enrolled in a particular course.
  getCourseStudents(courseId: string) {
    return axiosClient.get<CourseEnrollment>(
      `/api/admin/courses/${courseId}/enroll`
    );
  },
  // Add a student to the course enrollment list.
  enrollStudent(courseId: string, payload: EnrollmentPayload) {
    return axiosClient.post<CourseEnrollmentSummary>(
      `/api/admin/courses/${courseId}/enrollments`,
      payload
    );
  },
  // Remove a student from the course enrollment list.
  unenrollStudent(courseId: string, studentId: string) {
    return axiosClient.delete<void>(
      `/api/admin/courses/${courseId}/enrollments/${studentId}`
    );
  },
  // Flag a student account as banned, preventing further access.
  banStudent(userId: string) {
    return axiosClient.post<StudentSummary>(`/api/admin/users/${userId}/ban`);
  },
  // Restore access for a previously banned student account.
  unbanStudent(userId: string) {
    return axiosClient.post<StudentSummary>(`/api/admin/users/${userId}/unban`);
  },
};
