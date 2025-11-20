export type UserRole = "STUDENT" | "LECTURER" | "ADMIN";
export type NonAdminUserRole = Exclude<UserRole, "ADMIN">;

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string | null;
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
  role: NonAdminUserRole;
  department: string;
}

export interface Attachment {
  id?: string;
  fileName: string;
  mimeType: string;
  size: number;
  url: string;
  downloadUrl?: string;
}

export type MessageType = "TEXT" | "FILE";

export interface MessageReplySummary {
  id: string;
  createdAt: string;
  preview?: string | null;
  contentPreview?: string | null;
  sender?: {
    id: string;
    name: string;
    role: UserRole;
  } | null;
}

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
  isPinned?: boolean;
  pinnedAt?: string | null;
  pinnedById?: string | null;
  pinnedBy?: {
    id: string;
    name: string;
    role: UserRole;
  } | null;
  parentMessageId?: string | null;
  replyCount?: number;
  latestReply?: MessageReplySummary | null;
}

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string | null;
}

export interface LecturerSummary extends UserSummary {}

export interface Course {
  id: string;
  code: string;
  title: string;
  description?: string;
  lecturer?: UserSummary | null;
  studentCount?: number;
  unreadCount: number;
}

export interface StudentSummary extends UserSummary {
  isBanned?: boolean;
}

export interface AdminCourse extends Course {
  lecturer?: LecturerSummary | null;
  studentCount?: number;
}

export interface CourseEnrollment {
  courseId: string;
  students: StudentSummary[];
}

export interface CourseEnrollmentSummary {
  courseId: string;
  student: StudentSummary;
}
