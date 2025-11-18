import axiosClient from "./axiosClient";
import { Course } from "../types/api";

export const courseApi = {
  getMyCourses() {
    return axiosClient.get<Course[]>("/api/courses/my");
  },
};
