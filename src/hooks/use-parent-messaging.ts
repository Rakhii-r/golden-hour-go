import { useCallback, useEffect, useRef, useState } from "react";
import { parentSupabase } from "@/lib/parent-supabase";
import {
  getConversations,
  getMessages,
  getOrCreateConversation,
  getTeachersForStudent,
  getTotalUnreadCount,
  markConversationRead,
  sendMessage,
  uploadMessageAttachment,
  type ConversationItem,
  type MessageItem,
  type TeacherProfile,
} from "@/lib/parent-messaging";

// ── Module-level unread cache (shared like useParentAuth) ─────────────

interface UnreadStore {
  count: number;
  parentId: string | null;
}

const unreadStore: UnreadStore = { count: 0, parentId: null };
const unreadListeners = new Set<() => void>();

function notifyUnread() {
  unreadListeners.forEach((l) => l());
}

function setUnreadCount(n: number) {
  unreadStore.count = n;
  notifyUnread();
}

// ── Main hook ──────────────────────────────────────────────────────────

export function useParentMessaging(params: {
  parentId: string | null;
  studentId: string | null;
  orgId: string | null;
  className?: string | null;
  sectionName?: string | null;
}) {
  const { parentId, studentId, orgId, className, sectionName } = params;

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const msgChannelRef = useRef<ReturnType<typeof parentSupabase.channel> | null>(null);
  const convChannelRef = useRef<ReturnType<typeof parentSupabase.channel> | null>(null);

  // ── Load conversations ─────────────────────────────────────────────

  const loadConversations = useCallback(async () => {
    if (!parentId || !orgId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getConversations(parentId, orgId);
      setConversations(data); // unread effect above will sync setUnreadCount
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load conversations");
    } finally {
      setLoading(false);
    }
  }, [parentId, orgId]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // ── Sync global unread count whenever conversations state changes ──
  // This is the single place unread count is derived — no setState-in-setter.
  useEffect(() => {
    if (!parentId) return;
    const total = conversations.reduce((s, c) => s + (c.parent_unread_count ?? 0), 0);
    if (unreadStore.parentId !== parentId) unreadStore.parentId = parentId;
    setUnreadCount(total);
  }, [conversations, parentId]);

  // ── Load messages for active conversation ──────────────────────────

  const loadMessages = useCallback(async (conversationId: string) => {
    setMessagesLoading(true);
    try {
      const data = await getMessages(conversationId);
      setMessages(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load messages");
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  // ── Open a conversation ────────────────────────────────────────────

  const openConversation = useCallback(
    async (conversationId: string) => {
      setActiveConversationId(conversationId);
      await loadMessages(conversationId);

      // Mark messages as read
      if (parentId) {
        await markConversationRead(conversationId, parentId);
        // Zero out unread count locally — the unread useEffect will sync the badge
        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId ? { ...c, parent_unread_count: 0 } : c,
          ),
        );
      }
    },
    [loadMessages, parentId],
  );

  // ── Start or open conversation with a teacher ──────────────────────

  const startConversationWithTeacher = useCallback(
    async (teacher: TeacherProfile) => {
      if (!parentId || !studentId || !orgId) return;
      setLoading(true);
      try {
        const conv = await getOrCreateConversation({
          parentId,
          teacherId: teacher.id,
          studentId,
          orgId,
        });
        // Hydrate teacher if not present
        const hydrated = { ...conv, teacher };
        setConversations((prev) => {
          const exists = prev.find((c) => c.id === hydrated.id);
          if (exists) return prev.map((c) => (c.id === hydrated.id ? { ...c, teacher } : c));
          return [hydrated, ...prev];
        });
        await openConversation(hydrated.id);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to start conversation");
      } finally {
        setLoading(false);
      }
    },
    [parentId, studentId, orgId, openConversation],
  );

  // ── Send a message ─────────────────────────────────────────────────

  const send = useCallback(
    async (text: string, file?: File | null) => {
      if (!parentId || !studentId || !orgId || !activeConversationId) return;

      const conv = conversations.find((c) => c.id === activeConversationId);
      if (!conv) return;

      setSendingMessage(true);
      try {
        let attachmentUrl: string | null = null;
        if (file) {
          attachmentUrl = await uploadMessageAttachment(parentId, file);
        }

        const msg = await sendMessage({
          conversationId: activeConversationId,
          parentId,
          teacherId: conv.teacher_id,
          studentId,
          orgId,
          message: text,
          attachmentUrl,
        });

        // Optimistically add to messages list
        setMessages((prev) => [...prev, msg]);

        // Update conversation preview locally
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConversationId
              ? { ...c, last_message: text, last_message_at: msg.created_at }
              : c,
          ),
        );
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to send message");
      } finally {
        setSendingMessage(false);
      }
    },
    [parentId, studentId, orgId, activeConversationId, conversations],
  );

  // ── Realtime: subscribe to messages for active conversation ────────

  useEffect(() => {
    // Unsubscribe previous channel
    if (msgChannelRef.current) {
      parentSupabase.removeChannel(msgChannelRef.current);
      msgChannelRef.current = null;
    }

    if (!activeConversationId) return;

    const channel = parentSupabase
      .channel(`messages-${activeConversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${activeConversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as MessageItem;
          // Avoid duplicates (we optimistically add our own messages)
          setMessages((prev) =>
            prev.find((m) => m.id === newMsg.id) ? prev : [...prev, newMsg],
          );
          // If from teacher, mark as read immediately since chat is open
          if (newMsg.sender_role === "teacher" && parentId) {
            markConversationRead(activeConversationId, parentId).catch(() => {});
          }
        },
      )
      .on(
        "postgres_changes",
        {
          // Teacher marks parent's sent messages as read → update ticks
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${activeConversationId}`,
        },
        (payload) => {
          const updated = payload.new as MessageItem;
          setMessages((prev) =>
            prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m)),
          );
        },
      )
      .subscribe();

    msgChannelRef.current = channel;

    return () => {
      parentSupabase.removeChannel(channel);
    };
  }, [activeConversationId, parentId]);

  // ── Realtime: subscribe to conversation updates (unread counts) ────

  useEffect(() => {
    if (!parentId) return;

    const channel = parentSupabase
      .channel(`conversations-${parentId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            loadConversations();
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as ConversationItem;
            if (updated.parent_id !== parentId) return;
            // Single setConversations call — the unread useEffect derives the badge
            setConversations((prev) =>
              prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)),
            );
          }
        },
      )
      .subscribe();

    convChannelRef.current = channel;

    return () => {
      parentSupabase.removeChannel(channel);
    };
  }, [parentId, loadConversations]);

  // ── Load teachers for new-conversation picker ──────────────────────

  const loadTeachers = useCallback(async () => {
    if (!orgId) return;
    setTeachersLoading(true);
    try {
      const data = await getTeachersForStudent(orgId, className, sectionName);
      setTeachers(data);
    } catch {
      setTeachers([]);
    } finally {
      setTeachersLoading(false);
    }
  }, [orgId, className, sectionName]);

  // ── Active conversation object ──────────────────────────────────────

  const activeConversation = conversations.find((c) => c.id === activeConversationId) ?? null;

  return {
    conversations,
    activeConversation,
    activeConversationId,
    messages,
    teachers,
    loading,
    messagesLoading,
    teachersLoading,
    sendingMessage,
    error,
    openConversation,
    startConversationWithTeacher,
    send,
    loadTeachers,
    reload: loadConversations,
  };
}

// ── Lightweight hook for sidebar unread badge ─────────────────────────

export function useParentUnreadCount(parentId: string | null, orgId: string | null) {
  const [count, setCount] = useState(unreadStore.count);

  useEffect(() => {
    const listener = () => setCount(unreadStore.count);
    unreadListeners.add(listener);

    // Initial fetch if we haven't loaded for this parent yet
    if (parentId && orgId && unreadStore.parentId !== parentId) {
      getTotalUnreadCount(parentId, orgId).then((n) => {
        unreadStore.parentId = parentId;
        setUnreadCount(n);
      });
    }

    return () => { unreadListeners.delete(listener); };
  }, [parentId, orgId]);

  return count;
}
