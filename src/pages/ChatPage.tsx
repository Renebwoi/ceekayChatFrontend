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
    unreadCount: 0,
  },
  {
    id: "course-2",
    code: "MATH201",
    title: "Linear Algebra for Engineers",
    description:
      "Discuss weekly problem sets, exam prep, and project milestones.",
    unreadCount: 0,
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

const SEARCH_DEBOUNCE_MS = 300;
const MIN_SEARCH_LENGTH = 2;

interface ThreadCacheEntry {
  messages: Message[];
  cursor: string | null;
  hasMore: boolean;
}

function makeThreadCacheKey(courseId: string, parentId: string): string {
  return `${courseId}__${parentId}`;
}

export function ChatPage() {
  const { user, token, logout } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>({});
  const [pinningMessageId, setPinningMessageId] = useState<string | null>(null);
  const [replyTarget, setReplyTarget] = useState<Message | null>(null);
  const [activeThreadParentId, setActiveThreadParentId] =
    useState<string | null>(null);
  const [threadMessages, setThreadMessages] = useState<Message[]>([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [threadCursor, setThreadCursor] = useState<string | null>(null);
  const [threadHasMore, setThreadHasMore] = useState(false);
  const [threadError, setThreadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [searchCursor, setSearchCursor] = useState<string | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchHasMore, setSearchHasMore] = useState(false);
  const filePreviewUrls = useRef<string[]>([]);
  const searchRequestRef = useRef(0);
  const previousCourseIdRef = useRef<string | null>(null);
  const activeThreadRef = useRef<string | null>(null);
  const threadCacheRef = useRef<Map<string, ThreadCacheEntry>>(new Map());

  useEffect(() => {
    activeThreadRef.current = activeThreadParentId;
  }, [activeThreadParentId]);

  useEffect(() => {
    setReplyTarget(null);
    setActiveThreadParentId(null);
    setThreadMessages([]);
    setThreadCursor(null);
    setThreadHasMore(false);
    setThreadError(null);
    threadCacheRef.current.clear();
  }, [selectedCourseId]);

  const markCourseAsRead = useCallback(async (courseId: string) => {
    try {
      await courseApi.markCourseRead(courseId);
      setCourses((prev) =>
        prev.map((course) =>
          course.id === courseId ? { ...course, unreadCount: 0 } : course
        )
      );
      return true;
    } catch (error) {
      console.error($lf(109), "Failed to mark course as read", error);
      return false;
    }
  }, []);

  const selectedCourse = useMemo(() => {
    if (!Array.isArray(courses)) {
      return null;
    }
    return courses.find((course) => course.id === selectedCourseId) ?? null;
  }, [courses, selectedCourseId]);

  const currentMessages = selectedCourseId
    ? normalizeMessageList(messagesMap[selectedCourseId])
    : [];

  const pinnedMessageId = useMemo(() => {
    const pinned = currentMessages.find((message) => message.isPinned);
    return pinned ? pinned.id : null;
  }, [currentMessages]);

  const messageLookup = useMemo(() => {
    const map = new Map<string, Message>();
    currentMessages.forEach((message) => map.set(message.id, message));
    threadMessages.forEach((message) => map.set(message.id, message));
    return map;
  }, [currentMessages, threadMessages]);

  const threadParentMessage = useMemo(() => {
    if (!activeThreadParentId) {
      return null;
    }
    return messageLookup.get(activeThreadParentId) ?? null;
  }, [activeThreadParentId, messageLookup]);

  const getParentMessage = useCallback(
    (messageId: string) => messageLookup.get(messageId) ?? null,
    [messageLookup]
  );

  const trimmedSearchQuery = searchQuery.trim();
  const isSearchActive =
    Boolean(selectedCourseId) && trimmedSearchQuery.length >= MIN_SEARCH_LENGTH;

  useEffect(() => {
    if (
      previousCourseIdRef.current &&
      previousCourseIdRef.current !== selectedCourseId
    ) {
      setSearchResults([]);
      setSearchCursor(null);
      setSearchHasMore(false);
      setSearchError(null);
      setSearchLoading(false);
    }
    previousCourseIdRef.current = selectedCourseId;
  }, [selectedCourseId]);

  useEffect(() => {
    if (!selectedCourseId) {
      setSearchResults([]);
      setSearchCursor(null);
      setSearchHasMore(false);
      setSearchError(null);
      setSearchLoading(false);
      return () => {};
    }

    if (trimmedSearchQuery.length < MIN_SEARCH_LENGTH) {
      setSearchResults([]);
      setSearchCursor(null);
      setSearchHasMore(false);
      setSearchError(null);
      setSearchLoading(false);
      return () => {};
    }

    const requestId = ++searchRequestRef.current;
    let cancelled = false;
    setSearchLoading(true);
    setSearchError(null);

    const timeoutId: ReturnType<typeof setTimeout> = setTimeout(async () => {
      try {
        const { data } = await messageApi.searchMessages(
          selectedCourseId,
          trimmedSearchQuery
        );

        if (cancelled || searchRequestRef.current !== requestId) {
          return;
        }

        const normalized = normalizeMessageList(data?.messages);
        setSearchResults(normalized);
        const nextCursor =
          typeof data?.nextCursor === "string" && data.nextCursor.length
            ? data.nextCursor
            : null;
        setSearchCursor(nextCursor);
        const rawHasMore =
          typeof data.hasMore === "boolean" ? data.hasMore : undefined;
        const hasMoreFlag =
          typeof rawHasMore === "boolean"
            ? Boolean(rawHasMore)
            : Boolean(nextCursor);
        setSearchHasMore(hasMoreFlag);
      } catch (error) {
        if (cancelled || searchRequestRef.current !== requestId) {
          return;
        }

        console.error($lf(150), "Failed to search messages", error);
        setSearchResults([]);
        setSearchCursor(null);
        setSearchHasMore(false);
        setSearchError(
          "We couldn't search messages right now. Please try again."
        );
      } finally {
        if (!cancelled && searchRequestRef.current === requestId) {
          setSearchLoading(false);
        }
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [selectedCourseId, trimmedSearchQuery]);

  useEffect(() => {
    if (!selectedCourseId || !activeThreadParentId) {
      setThreadMessages([]);
      setThreadCursor(null);
      setThreadHasMore(false);
      setThreadLoading(false);
      setThreadError(null);
      return;
    }

    let cancelled = false;
    const loadReplies = async () => {
      setThreadLoading(true);
      setThreadError(null);
      try {
        const { data } = await messageApi.getReplies(
          selectedCourseId,
          activeThreadParentId
        );
        if (cancelled) {
          return;
        }
        const normalized = extractMessagesFromResponse(data);
        const cacheKey = makeThreadCacheKey(
          selectedCourseId,
          activeThreadParentId
        );
        const existingEntry = threadCacheRef.current.get(cacheKey);
        const mergedMessages = mergeThreadMessages(
          existingEntry?.messages ?? [],
          normalized
        );
        setThreadMessages(mergedMessages);
        const nextCursor =
          typeof data?.nextCursor === "string" && data.nextCursor.length
            ? data.nextCursor
            : null;
        setThreadCursor(nextCursor);
        const hasMoreFlag =
          typeof data?.hasMore === "boolean"
            ? Boolean(data.hasMore)
            : Boolean(nextCursor);
        setThreadHasMore(hasMoreFlag);
        threadCacheRef.current.set(cacheKey, {
          messages: mergedMessages,
          cursor: nextCursor,
          hasMore: hasMoreFlag,
        });
      } catch (error) {
        if (cancelled) {
          return;
        }
        console.error($lf(188), "Failed to load replies", error);
        setThreadMessages([]);
        setThreadCursor(null);
        setThreadHasMore(false);
        setThreadError(
          "We couldn't load the reply thread. Please try again."
        );
      } finally {
        if (!cancelled) {
          setThreadLoading(false);
        }
      }
    };

    loadReplies();

    return () => {
      cancelled = true;
    };
  }, [activeThreadParentId, selectedCourseId]);

  useEffect(() => {
    const loadCourses = async () => {
      setCoursesLoading(true);
      try {
        const { data } = await courseApi.getMyCourses();
        const rawCourses = Array.isArray(data)
          ? (data as Course[])
          : Array.isArray((data as { courses?: Course[] })?.courses)
          ? ((data as { courses?: Course[] }).courses as Course[])
          : [];

        const normalizedCourses = rawCourses.map((course) =>
          normalizeCourseEntity(course)
        );

        setCourses(normalizedCourses);
        if (!selectedCourseId && normalizedCourses.length) {
          setSelectedCourseId(normalizedCourses[0].id);
        }
      } catch (error) {
        console.error($lf(115), "Failed to load courses", error);
        const normalizedFallback = fallbackCourses.map((course) =>
          normalizeCourseEntity(course)
        );
        setCourses(normalizedFallback);
        if (!selectedCourseId && normalizedFallback.length) {
          setSelectedCourseId(normalizedFallback[0].id);
        }
      } finally {
        setCoursesLoading(false);
      }
    };

    loadCourses();
  }, [selectedCourseId]);

  const setMessagesForCourse = useCallback(
    (courseId: string, items: Message[]) => {
      const normalizedItems = normalizeMessageList(items);
      setMessagesMap((prev) => ({ ...prev, [courseId]: normalizedItems }));
    },
    []
  );

  const appendMessage = useCallback((courseId: string, message: Message) => {
    const normalizedMessage = normalizeMessage(message);
    setMessagesMap((prev) => {
      const existing = normalizeMessageList(prev[courseId]);
      console.log($lf(138), "existing messages for course", courseId, existing);
      if (existing.find((item) => item.id === normalizedMessage.id)) {
        return prev;
      }
      return {
        ...prev,
        [courseId]: [...existing, normalizedMessage],
      };
    });
  }, []);

  const selectThread = useCallback(
    (parentId: string, courseId?: string) => {
      const resolvedCourseId = courseId ?? selectedCourseId;
      if (!resolvedCourseId) {
        return;
      }

      const cacheKey = makeThreadCacheKey(resolvedCourseId, parentId);
      const cached = threadCacheRef.current.get(cacheKey);

      if (cached) {
        setThreadMessages(cached.messages);
        setThreadCursor(cached.cursor);
        setThreadHasMore(cached.hasMore);
      } else {
        setThreadMessages([]);
        setThreadCursor(null);
        setThreadHasMore(false);
      }

      setThreadError(null);
      setActiveThreadParentId(parentId);
    },
    [selectedCourseId]
  );

  const maybeInsertThreadMessage = useCallback((message: Message) => {
    if (!message.parentMessageId) {
      return;
    }
    const cacheKey = makeThreadCacheKey(
      message.courseId,
      message.parentMessageId
    );
    const existingEntry = threadCacheRef.current.get(cacheKey);
    const cachedMessages = existingEntry?.messages ?? [];
    const mergedCache = mergeThreadMessages(cachedMessages, [message]);
    threadCacheRef.current.set(cacheKey, {
      messages: mergedCache,
      cursor: existingEntry?.cursor ?? null,
      hasMore: existingEntry?.hasMore ?? false,
    });

    if (activeThreadRef.current !== message.parentMessageId) {
      return;
    }

    setThreadMessages((prev) => mergeThreadMessages(prev, [message]));
  }, []);

  const handleReplyToMessage = useCallback(
    (message: Message) => {
      if (!selectedCourseId || message.courseId !== selectedCourseId) {
        return;
      }
      const parentId = message.parentMessageId ?? message.id;
      selectThread(parentId, message.courseId);
      const parent =
        messageLookup.get(parentId) ?? normalizeMessage(message);
      setReplyTarget(parent);
    },
    [messageLookup, selectThread, selectedCourseId]
  );

  const handleOpenThread = useCallback(
    (message: Message) => {
      if (!selectedCourseId || message.courseId !== selectedCourseId) {
        return;
      }
      const parentId = message.parentMessageId ?? message.id;
      selectThread(parentId, message.courseId);
    },
    [selectThread, selectedCourseId]
  );

  const handleCancelReply = useCallback(() => {
    setReplyTarget(null);
  }, []);

  const handleCloseThread = useCallback(() => {
    setActiveThreadParentId(null);
    setThreadMessages([]);
    setThreadCursor(null);
    setThreadHasMore(false);
    setThreadError(null);
    setReplyTarget(null);
  }, []);

  const handleThreadLoadMore = useCallback(async () => {
    if (!selectedCourseId || !activeThreadParentId || !threadCursor) {
      return;
    }

    setThreadLoading(true);
    setThreadError(null);
    try {
      const { data } = await messageApi.getReplies(
        selectedCourseId,
        activeThreadParentId,
        threadCursor
      );
  const normalized = extractMessagesFromResponse(data);
      const cacheKey = makeThreadCacheKey(
        selectedCourseId,
        activeThreadParentId
      );
      let mergedMessages: Message[] = [];
      setThreadMessages((prev) => {
        const merged = mergeThreadMessages(prev, normalized);
        mergedMessages = merged;
        return merged;
      });
      const nextCursor =
        typeof data?.nextCursor === "string" && data.nextCursor.length
          ? data.nextCursor
          : null;
      setThreadCursor(nextCursor);
      const hasMoreFlag =
        typeof data?.hasMore === "boolean"
          ? Boolean(data.hasMore)
          : Boolean(nextCursor);
      setThreadHasMore(hasMoreFlag);
      threadCacheRef.current.set(cacheKey, {
        messages: mergedMessages,
        cursor: nextCursor,
        hasMore: hasMoreFlag,
      });
    } catch (error) {
      console.error($lf(215), "Failed to load more replies", error);
      setThreadError("We couldn't load more replies. Please try again.");
    } finally {
      setThreadLoading(false);
    }
  }, [activeThreadParentId, selectedCourseId, threadCursor]);

  const applyPinnedState = useCallback(
    (
      courseId: string,
      pinned: Message | null,
      fallbackMessageId?: string | null
    ) => {
      setMessagesMap((prev) => {
        const existing = normalizeMessageList(prev[courseId]);
        const targetId = pinned?.id ?? fallbackMessageId ?? null;

        const updated = existing.map((message) => {
          const normalizedMessage = normalizeMessage(message);
          if (pinned && message.id === pinned.id) {
            return normalizeMessage({
              ...normalizedMessage,
              ...pinned,
              isPinned: true,
            });
          }

          if (!pinned && targetId && message.id === targetId) {
            return normalizeMessage({
              ...normalizedMessage,
              isPinned: false,
              pinnedAt: null,
              pinnedBy: null,
              pinnedById: null,
            });
          }

          if (pinned && message.isPinned && message.id !== pinned.id) {
            return normalizeMessage({
              ...normalizedMessage,
              isPinned: false,
              pinnedAt: null,
              pinnedBy: null,
              pinnedById: null,
            });
          }

          if (!pinned && message.isPinned) {
            return normalizeMessage({
              ...normalizedMessage,
              isPinned: false,
              pinnedAt: null,
              pinnedBy: null,
              pinnedById: null,
            });
          }

          return normalizedMessage;
        });

        if (pinned && !updated.some((message) => message.id === pinned.id)) {
          updated.push(normalizeMessage({ ...pinned, isPinned: true }));
        }

        return { ...prev, [courseId]: updated };
      });
    },
    []
  );

  useEffect(() => {
    if (!selectedCourseId) return;

    let ignore = false;
    const loadMessages = async () => {
      setMessagesLoading(true);
      try {
        const { data } = await messageApi.getMessages(selectedCourseId);
        const normalizedMessages = normalizeMessageList(data?.messages);
        if (!ignore) {
          setMessagesForCourse(selectedCourseId, normalizedMessages);
          if (!ignore) {
            await markCourseAsRead(selectedCourseId);
          }
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
  }, [markCourseAsRead, selectedCourseId, setMessagesForCourse]);

  const handleSocketMessage = useCallback(
    (incoming: Message) => {
      const normalizedIncoming = normalizeMessage(incoming);
      appendMessage(normalizedIncoming.courseId, normalizedIncoming);
      maybeInsertThreadMessage(normalizedIncoming);

      const senderId =
        typeof normalizedIncoming.senderId === "string"
          ? normalizedIncoming.senderId
          : normalizedIncoming.sender &&
            typeof normalizedIncoming.sender.id === "string"
          ? normalizedIncoming.sender.id
          : null;
      const currentUserId = user?.id ?? null;

      if (normalizedIncoming.courseId === selectedCourseId) {
        markCourseAsRead(normalizedIncoming.courseId);
      }

      setCourses((prev) =>
        prev.map((course) => {
          if (course.id !== normalizedIncoming.courseId) {
            return course;
          }
          if (senderId && currentUserId && senderId === currentUserId) {
            return course;
          }
          if (normalizedIncoming.courseId === selectedCourseId) {
            return { ...course, unreadCount: 0 };
          }
          return {
            ...course,
            unreadCount: course.unreadCount + 1,
          };
        })
      );
    },
    [
      appendMessage,
      markCourseAsRead,
      maybeInsertThreadMessage,
      selectedCourseId,
      user?.id,
    ]
  );

  const handleSocketPinned = useCallback(
    (payload: unknown) => {
      const parsed = parsePinnedPayload(payload);
      if (!parsed) return;
      applyPinnedState(
        parsed.courseId,
        parsed.message ?? null,
        parsed.messageId ?? null
      );
    },
    [applyPinnedState]
  );

  const handleSocketUnpinned = useCallback(
    (payload: unknown) => {
      const parsed = parsePinnedPayload(payload);
      if (!parsed) return;
      applyPinnedState(
        parsed.courseId,
        null,
        parsed.messageId ?? parsed.message?.id ?? null
      );
    },
    [applyPinnedState]
  );

  useSocket({
    token,
    onMessage: handleSocketMessage,
    onMessagePinned: handleSocketPinned,
    onMessageUnpinned: handleSocketUnpinned,
  });

  const handleSelectCourse = useCallback((courseId: string) => {
    setSelectedCourseId(courseId);
  }, []);

  const handleSearchQueryChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const handleSendMessage = useCallback(
    async (
      content: string,
      options?: { parentMessageId?: string | null }
    ) => {
      if (!selectedCourseId || !user) return;

      const parentMessageId = options?.parentMessageId ?? replyTarget?.id ?? null;
      setSending(true);
      try {
        const { data } = await messageApi.sendMessage(selectedCourseId, {
          content,
          parentMessageId,
        });
        const normalized = normalizeMessage(data);
        appendMessage(selectedCourseId, normalized);
        maybeInsertThreadMessage(normalized);
        markCourseAsRead(selectedCourseId);
        setReplyTarget(null);
      } catch (error) {
        console.error($lf(203), "Failed to send message", error);
        const optimistic: Message = {
          id: `temp-${Date.now()}`,
          courseId: selectedCourseId,
          senderId: user.id,
          content,
          type: "TEXT",
          createdAt: new Date().toISOString(),
          parentMessageId,
          sender: {
            id: user.id,
            name: user.name,
            role: user.role,
          },
        };
        appendMessage(selectedCourseId, optimistic);
        maybeInsertThreadMessage(optimistic);
        setReplyTarget(null);
      } finally {
        setSending(false);
      }
    },
    [
      appendMessage,
      markCourseAsRead,
      maybeInsertThreadMessage,
      replyTarget?.id,
      selectedCourseId,
      user,
    ]
  );

  const handleUploadFile = useCallback(
    async (
      file: File,
      options?: { parentMessageId?: string | null }
    ) => {
      if (!selectedCourseId || !user) return;

      const parentMessageId = options?.parentMessageId ?? replyTarget?.id ?? null;
      setSending(true);
      try {
        const { data } = await messageApi.uploadFile(selectedCourseId, file, {
          parentMessageId: parentMessageId ?? undefined,
        });
        const normalized = normalizeMessage(data);
        appendMessage(selectedCourseId, normalized);
        maybeInsertThreadMessage(normalized);
        markCourseAsRead(selectedCourseId);
        setReplyTarget(null);
      } catch (error) {
        console.error($lf(237), "Failed to upload file", error);
        const previewUrl = URL.createObjectURL(file);
        filePreviewUrls.current.push(previewUrl);
        const optimistic: Message = {
          id: `temp-file-${Date.now()}`,
          courseId: selectedCourseId,
          senderId: user.id,
          content: null,
          type: "FILE",
          createdAt: new Date().toISOString(),
          parentMessageId,
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
        maybeInsertThreadMessage(optimistic);
        setReplyTarget(null);
      } finally {
        setSending(false);
      }
    },
    [
      appendMessage,
      markCourseAsRead,
      maybeInsertThreadMessage,
      replyTarget?.id,
      selectedCourseId,
      user,
    ]
  );

  const handlePinMessage = useCallback(
    async (messageId: string) => {
      if (!selectedCourseId || !user) return;
      setPinningMessageId(messageId);
      try {
        const { data } = await messageApi.pinMessage(
          selectedCourseId,
          messageId
        );
        const pinnedMessage = isMessage(data)
          ? normalizeMessage({ ...data, isPinned: true })
          : null;
        applyPinnedState(selectedCourseId, pinnedMessage, messageId);
      } catch (error) {
        console.error($lf(263), "Failed to pin message", error);
      } finally {
        setPinningMessageId(null);
      }
    },
    [applyPinnedState, selectedCourseId, user]
  );

  const handleUnpinMessage = useCallback(
    async (messageId: string) => {
      if (!selectedCourseId || !user) return;
      setPinningMessageId(messageId);
      try {
        const { data } = await messageApi.unpinMessage(
          selectedCourseId,
          messageId
        );
        const responseMessage = isMessage(data) ? normalizeMessage(data) : null;
        applyPinnedState(
          selectedCourseId,
          null,
          responseMessage?.id ?? messageId
        );
      } catch (error) {
        console.error($lf(279), "Failed to unpin message", error);
      } finally {
        setPinningMessageId(null);
      }
    },
    [applyPinnedState, selectedCourseId, user]
  );

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    setSearchResults([]);
    setSearchCursor(null);
    setSearchHasMore(false);
    setSearchError(null);
    setSearchLoading(false);
  }, []);

  const handleSearchLoadMore = useCallback(async () => {
    if (!selectedCourseId || !searchCursor) {
      return;
    }

    const query = trimmedSearchQuery;
    if (query.length < MIN_SEARCH_LENGTH) {
      return;
    }

    setSearchLoading(true);
    setSearchError(null);

    try {
      const { data } = await messageApi.searchMessages(
        selectedCourseId,
        query,
        searchCursor
      );
      const normalized = normalizeMessageList(data?.messages);
      setSearchResults((prev) => [...prev, ...normalized]);
      const nextCursor =
        typeof data?.nextCursor === "string" && data.nextCursor.length
          ? data.nextCursor
          : null;
      setSearchCursor(nextCursor);
      const rawHasMore =
        typeof data.hasMore === "boolean" ? data.hasMore : undefined;
      const hasMoreFlag =
        typeof rawHasMore === "boolean"
          ? Boolean(rawHasMore)
          : Boolean(nextCursor);
      setSearchHasMore(hasMoreFlag);
    } catch (error) {
      console.error($lf(337), "Failed to load more search results", error);
      setSearchError(
        "We couldn't load more results. Please try again in a moment."
      );
    } finally {
      setSearchLoading(false);
    }
  }, [searchCursor, selectedCourseId, trimmedSearchQuery]);

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
            canPin={user.role === "LECTURER"}
            pinnedMessageId={pinnedMessageId}
            onPinMessage={handlePinMessage}
            onUnpinMessage={handleUnpinMessage}
            pinningMessageId={pinningMessageId}
            searchQuery={searchQuery}
            onSearchQueryChange={handleSearchQueryChange}
            onClearSearch={handleClearSearch}
            isSearchActive={isSearchActive}
            searchResults={searchResults}
            searchLoading={searchLoading}
            searchError={searchError}
            searchHasMore={searchHasMore}
            onSearchLoadMore={handleSearchLoadMore}
            searchHighlightTerm={trimmedSearchQuery}
            onReplyToMessage={handleReplyToMessage}
            onOpenThread={handleOpenThread}
            replyTarget={replyTarget}
            onCancelReply={handleCancelReply}
            threadParent={threadParentMessage}
            threadMessages={threadMessages}
            threadLoading={threadLoading}
            threadHasMore={threadHasMore}
            onThreadLoadMore={handleThreadLoadMore}
            onCloseThread={handleCloseThread}
            messageLookup={getParentMessage}
            threadError={threadError}
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

function normalizeCourseEntity(course: Course): Course {
  const rawCount = (course as Course & { unreadCount?: number }).unreadCount;
  const parsedCount =
    typeof rawCount === "number" && Number.isFinite(rawCount) ? rawCount : 0;
  return {
    ...course,
    unreadCount: parsedCount,
  };
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
  if (
    value &&
    typeof value === "object" &&
    Array.isArray((value as { replies?: Message[] }).replies)
  ) {
    return (value as { replies: Message[] }).replies;
  }
  return [];
}

function normalizeMessageList(value: unknown): Message[] {
  const list = normalizeMessageState(value);
  return list.map((item) => normalizeMessage(item));
}

function extractMessagesFromResponse(payload: unknown): Message[] {
  if (!payload || typeof payload !== "object") {
    return [];
  }

  const candidate = payload as {
    messages?: unknown;
    replies?: unknown;
    data?: unknown;
  };

  if (Array.isArray(candidate.messages)) {
    return normalizeMessageList(candidate.messages);
  }

  if (Array.isArray(candidate.replies)) {
    return normalizeMessageList(candidate.replies);
  }

  if (candidate.data && typeof candidate.data === "object") {
    const nested = candidate.data as {
      messages?: unknown;
      replies?: unknown;
    };

    if (Array.isArray(nested.messages)) {
      return normalizeMessageList(nested.messages);
    }

    if (Array.isArray(nested.replies)) {
      return normalizeMessageList(nested.replies);
    }
  }

  return [];
}

function mergeThreadMessages(
  existing: Message[],
  incoming: Message[]
): Message[] {
  const map = new Map<string, Message>();
  existing.forEach((item) => {
    const normalized = normalizeMessage(item);
    map.set(normalized.id, normalized);
  });
  incoming.forEach((item) => {
    const normalized = normalizeMessage(item);
    map.set(normalized.id, normalized);
  });

  const merged = Array.from(map.values());
  merged.sort((a, b) => {
    const aTime = new Date(a.createdAt ?? "").getTime();
    const bTime = new Date(b.createdAt ?? "").getTime();
    return aTime - bTime;
  });

  return merged;
}

function normalizeMessage(value: Message): Message {
  if (!value) {
    return value;
  }

  const pinnedFlag =
    (value as Message & { pinned?: boolean }).isPinned ??
    (value as Message & { pinned?: boolean }).pinned ??
    false;

  const pinnedBy =
    (value as Message & { pinnedBy?: Message["sender"] | null }).pinnedBy ??
    null;

  const pinnedById =
    (value as Message & { pinnedById?: string | null }).pinnedById ??
    pinnedBy?.id ??
    null;

  return {
    ...value,
    isPinned: pinnedFlag,
    pinnedAt:
      (value as Message & { pinnedAt?: string | null }).pinnedAt ?? null,
    pinnedBy,
    pinnedById,
  };
}

function isMessage(value: unknown): value is Message {
  return (
    !!value &&
    typeof value === "object" &&
    typeof (value as { id?: unknown }).id === "string" &&
    typeof (value as { courseId?: unknown }).courseId === "string"
  );
}

function parsePinnedPayload(payload: unknown): {
  courseId: string;
  message?: Message | null;
  messageId?: string | null;
} | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const candidate = payload as {
    courseId?: unknown;
    message?: unknown;
    messageId?: unknown;
  };

  const message = isMessage(candidate.message)
    ? normalizeMessage(candidate.message)
    : null;
  const courseId =
    typeof candidate.courseId === "string"
      ? candidate.courseId
      : message?.courseId ?? null;

  if (!courseId) {
    return null;
  }

  const messageId =
    typeof candidate.messageId === "string"
      ? candidate.messageId
      : message?.id ?? null;

  return {
    courseId,
    message,
    messageId,
  };
}

function $lf(n: number) {
  return "$lf|pages/ChatPage.tsx:" + n + " >";
  // Automatically injected by Log Location Injector vscode extension
}
