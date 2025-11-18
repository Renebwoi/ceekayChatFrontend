import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { courseApi } from "../api/courseApi";
import { messageApi } from "../api/messageApi";
import { ChatWindow } from "../components/chat/ChatWindow";
import { MainLayout } from "../components/layout/MainLayout";
import { useAuth } from "../hooks/useAuth";
import { useSocket } from "../hooks/useSocket";
import { Course, Message } from "../types/api";

const fallbackCourses: Course[] = [
  {
    id: "course-1",
    code: "CS101",
    title: "Introduction to Computer Science",
    description:
      "Kick off foundational programming concepts and collaborative problem solving.",
  },
  {
    id: "course-2",
    code: "MATH201",
    title: "Linear Algebra for Engineers",
    description:
      "Discuss weekly problem sets, exam prep, and project milestones.",
  },
];

const fallbackMessages: Message[] = [
  {
    id: "message-1",
    courseId: "course-1",
    senderId: "lecturer-1",
    content:
      "Welcome to CS101! Please review the course outline before our first session.",
    type: "TEXT",
    createdAt: new Date().toISOString(),
    sender: {
      id: "lecturer-1",
      name: "Dr. Rivera",
      role: "LECTURER",
    },
  },
  {
    id: "message-2",
    courseId: "course-1",
    senderId: "student-3",
    content: "Does anyone want to form a study group for the first assignment?",
    type: "TEXT",
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    sender: {
      id: "student-3",
      name: "Marisa Chen",
      role: "STUDENT",
    },
  },
  {
    id: "message-3",
    courseId: "course-2",
    senderId: "lecturer-2",
    content:
      "Sharing the recap slides from lecture 4. Let me know if you have questions!",
    type: "FILE",
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    sender: {
      id: "lecturer-2",
      name: "Prof. Imani",
      role: "LECTURER",
    },
    attachment: {
      id: "attachment-3",
      fileName: "lecture-4-recap.pdf",
      mimeType: "application/pdf",
      size: 1.8 * 1024 * 1024,
      url: "https://files.edtech.dev/lecture-4-recap.pdf",
    },
  },
];

export function ChatPage() {
  const { user, token, logout } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>({});
  const filePreviewUrls = useRef<string[]>([]);

  const selectedCourse = useMemo(() => {
    if (!Array.isArray(courses)) {
      return null;
    }
    return courses.find((course) => course.id === selectedCourseId) ?? null;
  }, [courses, selectedCourseId]);

  const currentMessages = selectedCourseId
    ? normalizeMessageState(messagesMap[selectedCourseId])
    : [];

  useEffect(() => {
    const loadCourses = async () => {
      setCoursesLoading(true);
      try {
        const { data } = await courseApi.getMyCourses();
        const normalizedCourses = Array.isArray(data)
          ? data
          : Array.isArray((data as { courses?: Course[] })?.courses)
          ? (data as { courses?: Course[] }).courses!
          : [];

        setCourses(normalizedCourses);
        if (!selectedCourseId && normalizedCourses.length) {
          setSelectedCourseId(normalizedCourses[0].id);
        }
      } catch (error) {
        console.error($lf(115), "Failed to load courses", error);
        setCourses(fallbackCourses);
        if (!selectedCourseId && fallbackCourses.length) {
          setSelectedCourseId(fallbackCourses[0].id);
        }
      } finally {
        setCoursesLoading(false);
      }
    };

    loadCourses();
  }, [selectedCourseId]);

  const setMessagesForCourse = useCallback(
    (courseId: string, items: Message[]) => {
      setMessagesMap((prev) => ({ ...prev, [courseId]: items }));
    },
    []
  );

  const appendMessage = useCallback((courseId: string, message: Message) => {
    setMessagesMap((prev) => {
      const existing = normalizeMessageState(prev[courseId]);
      console.log($lf(138), "existing messages for course", courseId, existing);
      if (existing.find((item) => item.id === message.id)) {
        return prev;
      }
      return { ...prev, [courseId]: [...existing, message] };
    });
  }, []);

  useEffect(() => {
    if (!selectedCourseId) return;

    let ignore = false;
    const loadMessages = async () => {
      setMessagesLoading(true);
      try {
        const { data } = await messageApi.getMessages(selectedCourseId);
        const normalizedMessages = Array.isArray(data?.messages)
          ? data.messages
          : [];
        if (!ignore) {
          setMessagesForCourse(selectedCourseId, normalizedMessages);
        }
      } catch (error) {
        console.error($lf(158), "Failed to load messages", error);
        if (!ignore) {
          const fallback = fallbackMessages.filter(
            (message) => message.courseId === selectedCourseId
          );
          setMessagesForCourse(selectedCourseId, fallback);
        }
      } finally {
        if (!ignore) {
          setMessagesLoading(false);
        }
      }
    };

    loadMessages();

    return () => {
      ignore = true;
    };
  }, [selectedCourseId, setMessagesForCourse]);

  const handleSocketMessage = useCallback(
    (incoming: Message) => {
      appendMessage(incoming.courseId, incoming);
    },
    [appendMessage]
  );

  useSocket({ token, onMessage: handleSocketMessage });

  const handleSelectCourse = useCallback((courseId: string) => {
    setSelectedCourseId(courseId);
  }, []);

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!selectedCourseId || !user) return;
      setSending(true);
      try {
        const { data } = await messageApi.sendMessage(
          selectedCourseId,
          content
        );
        appendMessage(selectedCourseId, data);
      } catch (error) {
        console.error($lf(203), "Failed to send message", error);
        const optimistic: Message = {
          id: `temp-${Date.now()}`,
          courseId: selectedCourseId,
          senderId: user.id,
          content,
          type: "TEXT",
          createdAt: new Date().toISOString(),
          sender: {
            id: user.id,
            name: user.name,
            role: user.role,
          },
        };
        appendMessage(selectedCourseId, optimistic);
      } finally {
        setSending(false);
      }
    },
    [appendMessage, selectedCourseId, user]
  );

  const handleUploadFile = useCallback(
    async (file: File, caption?: string) => {
      if (!selectedCourseId || !user) return;
      setSending(true);
      try {
        const { data } = await messageApi.uploadFile(
          selectedCourseId,
          file,
          caption
        );
        appendMessage(selectedCourseId, data);
      } catch (error) {
        console.error($lf(237), "Failed to upload file", error);
        const previewUrl = URL.createObjectURL(file);
        filePreviewUrls.current.push(previewUrl);
        const optimistic: Message = {
          id: `temp-file-${Date.now()}`,
          courseId: selectedCourseId,
          senderId: user.id,
          content: caption ?? null,
          type: "FILE",
          createdAt: new Date().toISOString(),
          attachment: {
            fileName: file.name,
            mimeType: file.type,
            size: file.size,
            url: previewUrl,
          },
          sender: {
            id: user.id,
            name: user.name,
            role: user.role,
          },
        };
        appendMessage(selectedCourseId, optimistic);
      } finally {
        setSending(false);
      }
    },
    [appendMessage, selectedCourseId, user]
  );

  useEffect(
    () => () => {
      filePreviewUrls.current.forEach((url) => URL.revokeObjectURL(url));
    },
    []
  );

  if (!user) {
    return null;
  }

  return (
    <MainLayout
      user={user}
      courses={courses}
      selectedCourseId={selectedCourseId}
      onSelectCourse={handleSelectCourse}
      onLogout={logout}
      selectedCourse={selectedCourse}
      courseLoading={coursesLoading}
    >
      {selectedCourse ? (
        messagesLoading ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            Loading conversation…
          </div>
        ) : (
          <ChatWindow
            messages={currentMessages}
            currentUserId={user.id}
            onSendMessage={handleSendMessage}
            onUploadFile={handleUploadFile}
            disabled={sending}
          />
        )
      ) : coursesLoading ? (
        <div className="flex h-full items-center justify-center text-sm text-slate-500">
          Fetching your courses…
        </div>
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-slate-500">
          <p className="text-lg font-semibold">Choose a course channel</p>
          <p className="text-sm max-w-sm">
            Your chat history appears here once you pick a course from the
            sidebar. Start a conversation or upload resources to collaborate
            with your cohort.
          </p>
        </div>
      )}
    </MainLayout>
  );
}

function normalizeMessageState(value: unknown): Message[] {
  if (Array.isArray(value)) {
    return value as Message[];
  }
  if (
    value &&
    typeof value === "object" &&
    Array.isArray((value as { messages?: Message[] }).messages)
  ) {
    return (value as { messages: Message[] }).messages;
  }
  return [];
}

function $lf(n: number) {
  return "$lf|pages/ChatPage.tsx:" + n + " >";
  // Automatically injected by Log Location Injector vscode extension
}
