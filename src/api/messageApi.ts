import axiosClient from "./axiosClient";
import { Message } from "../types/api";

// Shape returned by the backend when querying course messages (supports pagination metadata).
export interface MessagesResponse {
  messages: Message[];
  nextCursor?: string | null;
  hasMore?: boolean;
  total?: number;
}

export const messageApi = {
  // Retrieve the latest messages for a specific course channel.
  getMessages(courseId: string) {
    return axiosClient.get<MessagesResponse>(
      `/api/courses/${courseId}/messages`
    );
  },
  // Post a plain text message to the course timeline.
  sendMessage(courseId: string, content: string) {
    return axiosClient.post<Message>(`/api/courses/${courseId}/messages`, {
      content,
    });
  },
  // Upload a file attachment associated with the course conversation.
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
  // Flag a message as pinned so it surfaces at the top of the chat window.
  pinMessage(courseId: string, messageId: string) {
    return axiosClient.post<Message>(
      `/api/courses/${courseId}/messages/${messageId}/pin`
    );
  },
  // Remove the pinned status previously applied to a message.
  unpinMessage(courseId: string, messageId: string) {
    return axiosClient.delete<Message>(
      `/api/courses/${courseId}/messages/${messageId}/pin`
    );
  },
  // Search historical messages, optionally continuing from a pagination cursor.
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
