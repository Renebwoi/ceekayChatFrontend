import axiosClient from "./axiosClient";
import { Course } from "../types/api";

export const courseApi = {
  // Fetch courses tied to the authenticated user (student or lecturer).
  getMyCourses() {
    return axiosClient.get<Course[]>("/api/courses/my");
  },
  // Inform the backend that a course's messages have been read to reset counters.
  markCourseRead(courseId: string) {
    return axiosClient.post<void>(`/api/courses/${courseId}/read`);
  },
};
