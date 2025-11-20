import axiosClient from "./axiosClient";
import { Message } from "../types/api";

export interface MessagesResponse {
  messages: Message[];
  nextCursor?: string | null;
  hasMore?: boolean;
  total?: number;
}

export interface CreateMessagePayload {
  content: string;
  parentMessageId?: string | null;
}

export interface UploadFileOptions {
  parentMessageId?: string | null;
}

export const messageApi = {
  getMessages(courseId: string) {
    return axiosClient.get<MessagesResponse>(
      `/api/courses/${courseId}/messages`
    );
  },
  sendMessage(courseId: string, payload: CreateMessagePayload) {
    return axiosClient.post<Message>(`/api/courses/${courseId}/messages`, {
      content: payload.content,
      parentMessageId: payload.parentMessageId ?? null,
    });
  },
  uploadFile(courseId: string, file: File, options?: UploadFileOptions) {
    const formData = new FormData();
    formData.append("file", file);
    if (options?.parentMessageId) {
      formData.append("parentMessageId", options.parentMessageId);
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
  getReplies(courseId: string, messageId: string, cursor?: string | null) {
    const params: Record<string, string> = {};
    if (cursor) {
      params.cursor = cursor;
    }

    return axiosClient.get<MessagesResponse>(
      `/api/courses/${courseId}/messages/${messageId}/replies`,
      { params }
    );
  },
  downloadAttachment(
    courseId: string,
    messageId: string,
    downloadUrl?: string | null
  ) {
    const resolvedUrl = resolveDownloadUrl(courseId, messageId, downloadUrl);
    return axiosClient.get<Blob>(resolvedUrl, {
      responseType: "blob",
    });
  },
};

function resolveDownloadUrl(
  courseId: string,
  messageId: string,
  downloadUrl?: string | null
): string {
  const trimmed = downloadUrl?.trim();
  if (trimmed) {
    return trimmed;
  }
  return `/api/courses/${courseId}/messages/${messageId}/attachment`;
}
