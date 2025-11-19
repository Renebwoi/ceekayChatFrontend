import axiosClient from "./axiosClient";
import { Message } from "../types/api";

export interface MessagesResponse {
  messages: Message[];
  nextCursor?: string | null;
  hasMore?: boolean;
  total?: number;
}

export const messageApi = {
  getMessages(courseId: string) {
    return axiosClient.get<MessagesResponse>(
      `/api/courses/${courseId}/messages`
    );
  },
  sendMessage(courseId: string, content: string) {
    return axiosClient.post<Message>(`/api/courses/${courseId}/messages`, {
      content,
    });
  },
  uploadFile(courseId: string, file: File) {
    const formData = new FormData();
    formData.append("file", file);
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
  pinMessage(courseId: string, messageId: string) {
    return axiosClient.post<Message>(
      `/api/courses/${courseId}/messages/${messageId}/pin`
    );
  },
  unpinMessage(courseId: string, messageId: string) {
    return axiosClient.delete<Message>(
      `/api/courses/${courseId}/messages/${messageId}/pin`
    );
  },
  searchMessages(courseId: string, query: string, cursor?: string | null) {
    const params: Record<string, string> = { q: query };
    if (cursor) {
      params.cursor = cursor;
    }

    return axiosClient.get<MessagesResponse>(
      `/api/courses/${courseId}/messages/search`,
      { params }
    );
  },
};
