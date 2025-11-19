import axiosClient from "./axiosClient";
import {
  AdminCourse,
  CourseEnrollment,
  CourseEnrollmentSummary,
  LecturerSummary,
  StudentSummary,
} from "../types/api";

export interface CreateCoursePayload {
  code: string;
  title: string;
  lecturerId?: string;
}

export interface AssignLecturerPayload {
  lecturerId: string | null;
}

export interface EnrollmentPayload {
  studentId: string;
}

export const adminApi = {
  getCourses() {
    return axiosClient.get<AdminCourse[]>("/api/admin/courses");
  },
  createCourse(payload: CreateCoursePayload) {
    return axiosClient.post<AdminCourse | { course: AdminCourse }>(
      "/api/admin/courses",
      payload
    );
  },
  deleteCourse(courseId: string) {
    return axiosClient.delete<void>(`/api/admin/courses/${courseId}`);
  },
  assignLecturer(courseId: string, payload: AssignLecturerPayload) {
    return axiosClient.patch<AdminCourse>(
      `/api/admin/courses/${courseId}/lecturer`,
      payload
    );
  },
  getLecturers() {
    return axiosClient.get<LecturerSummary[]>("/api/admin/lecturers");
  },
  getStudents() {
    return axiosClient.get<StudentSummary[]>("/api/admin/students");
  },
  getCourseStudents(courseId: string) {
    return axiosClient.get<CourseEnrollment>(
      `/api/admin/courses/${courseId}/enroll`
    );
  },
  enrollStudent(courseId: string, payload: EnrollmentPayload) {
    return axiosClient.post<CourseEnrollmentSummary>(
      `/api/admin/courses/${courseId}/enrollments`,
      payload
    );
  },
  unenrollStudent(courseId: string, studentId: string) {
    return axiosClient.delete<void>(
      `/api/admin/courses/${courseId}/enrollments/${studentId}`
    );
  },
  banStudent(userId: string) {
    return axiosClient.post<StudentSummary>(`/api/admin/users/${userId}/ban`);
  },
  unbanStudent(userId: string) {
    return axiosClient.post<StudentSummary>(`/api/admin/users/${userId}/unban`);
  },
};
