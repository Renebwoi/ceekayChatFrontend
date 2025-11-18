import axiosClient from "./axiosClient";
import { Message } from "../types/api";

export const messageApi = {
  getMessages(courseId: string) {
    return axiosClient.get<Message[]>(`/api/courses/${courseId}/messages`);
  },
  sendMessage(courseId: string, content: string) {
    return axiosClient.post<Message>(`/api/courses/${courseId}/messages`, {
      content,
    });
  },
  uploadFile(courseId: string, file: File, caption?: string) {
    const formData = new FormData();
    formData.append("file", file);
    if (caption) {
      formData.append("caption", caption);
    }
    return axiosClient.post<Message>(
      `/api/courses/${courseId}/uploads`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  },
};
