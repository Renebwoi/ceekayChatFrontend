import axiosClient from "./axiosClient";
import { Course } from "../types/api";

export const courseApi = {
  getMyCourses() {
    return axiosClient.get<Course[]>("/api/courses/my");
  },
  markCourseRead(courseId: string) {
    return axiosClient.post<void>(`/api/courses/${courseId}/read`);
  },
};
