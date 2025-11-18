export type UserRole = "STUDENT" | "LECTURER";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface Attachment {
  id?: string;
  fileName: string;
  mimeType: string;
  size: number;
  url: string;
}

export type MessageType = "TEXT" | "FILE";

export interface Message {
  id: string;
  courseId: string;
  senderId: string;
  content: string | null;
  type: MessageType;
  createdAt: string;
  attachment?: Attachment;
  sender?: {
    id: string;
    name: string;
    role: UserRole;
  };
}

export interface Course {
  id: string;
  code: string;
  title: string;
  description?: string;
}
