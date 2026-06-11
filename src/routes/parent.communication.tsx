import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Send,
  Paperclip,
  Search,
  ArrowLeft,
  Check,
  CheckCheck,
  Plus,
  X,
  FileText,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import { RequireParentAuth } from "@/components/parent/RequireParentAuth";
import { ParentLayout } from "@/components/parent/ParentLayout";
import {
  ParentDashboardProvider,
  useParentDashboardCtx,
} from "@/hooks/parent-dashboard-context";
import { useParentAuth } from "@/hooks/use-parent-auth";
import { useParentMessaging } from "@/hooks/use-parent-messaging";
import type { ConversationItem, MessageItem, TeacherProfile } from "@/lib/parent-messaging";

export const Route = createFileRoute("/parent/communication")({
  head: () => ({
    meta: [
      { title: "Messages — Parent Portal" },
      { name: "description", content: "Communicate with your child's teachers." },
    ],
  }),
  component: () => (
    <RequireParentAuth>
      <ParentDashboardProvider>
        <ParentLayout>
          <CommunicationPage />
        </ParentLayout>
      </ParentDashboardProvider>
    </RequireParentAuth>
  ),
});

/* ── Helpers ──────────────────────────────────────────────────────── */

function fmtTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  } catch {
    return "";
  }
}

function fmtRelativeDate(iso: string | null): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diffDays === 0) return fmtTime(iso);
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return d.toLocaleDateString("en-IN", { weekday: "short" });
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  } catch {
    return "";
  }
}

function avatarInitials(name: string | null | undefined): string {
  if (!name) return "T";
  return name.trim().split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function isImageUrl(url: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url);
}

/* ── Teacher avatar ───────────────────────────────────────────────── */
function TeacherAvatar({
  teacher,
  size = "md",
}: {
  teacher?: TeacherProfile | null;
  size?: "sm" | "md" | "lg";
}) {
  const sz = size === "sm" ? "h-8 w-8 text-xs" : size === "lg" ? "h-12 w-12 text-lg" : "h-10 w-10 text-sm";
  if (teacher?.avatar_url) {
    return (
      <img
        src={teacher.avatar_url}
        alt={teacher.name}
        className={`${sz} rounded-full object-cover shrink-0`}
      />
    );
  }
  return (
    <div
      className={`${sz} flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#155EEF] to-[#3B82F6] font-semibold text-white`}
    >
      {avatarInitials(teacher?.name)}
    </div>
  );
}

/* ── Read status icon ─────────────────────────────────────────────── */
function ReadStatus({ msg, parentId }: { msg: MessageItem; parentId: string }) {
  if (msg.sender_id !== parentId) return null;

  if (msg.status === "read") {
    const seenAt = msg.read_at ? fmtTime(msg.read_at) : null;
    return (
      <span title={seenAt ? `Seen ${seenAt}` : "Seen"} className="flex items-center gap-0.5">
        <CheckCheck className="h-3.5 w-3.5 text-blue-300" />
        {seenAt && (
          <span className="text-[9px] text-blue-300 leading-none">{seenAt}</span>
        )}
      </span>
    );
  }

  // 'sent' or 'delivered' — single grey tick
  return <Check className="h-3.5 w-3.5 text-blue-300/60" />;
}

/* ── Message bubble ───────────────────────────────────────────────── */
function MessageBubble({
  msg,
  parentId,
}: {
  msg: MessageItem;
  parentId: string;
}) {
  const isOwn = msg.sender_id === parentId;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex items-end gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
    >
      <div
        className={`max-w-[72%] rounded-2xl px-4 py-2.5 shadow-sm ${
          isOwn
            ? "rounded-br-sm bg-[#155EEF] text-white"
            : "rounded-bl-sm bg-white text-gray-800 border border-gray-100"
        }`}
      >
        {/* Attachment */}
        {msg.attachment_url && (
          <div className="mb-2">
            {isImageUrl(msg.attachment_url) ? (
              <a href={msg.attachment_url} target="_blank" rel="noreferrer">
                <img
                  src={msg.attachment_url}
                  alt="attachment"
                  className="max-h-48 max-w-full rounded-lg object-cover"
                />
              </a>
            ) : (
              <a
                href={msg.attachment_url}
                target="_blank"
                rel="noreferrer"
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium ${
                  isOwn ? "border-white/30 text-white/90 hover:bg-white/10" : "border-gray-200 text-[#155EEF] hover:bg-blue-50"
                }`}
              >
                <FileText className="h-4 w-4 shrink-0" />
                <span className="truncate">View Attachment</span>
              </a>
            )}
          </div>
        )}

        {/* Message text */}
        {msg.message && (
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
            {msg.message}
          </p>
        )}

        {/* Time + read status */}
        <div
          className={`mt-1 flex items-center gap-1 ${isOwn ? "justify-end" : "justify-start"}`}
        >
          <span className={`text-[10px] ${isOwn ? "text-blue-200" : "text-gray-400"}`}>
            {fmtTime(msg.created_at)}
          </span>
          <ReadStatus msg={msg} parentId={parentId} />
        </div>
      </div>
    </motion.div>
  );
}

/* ── Conversation list item ───────────────────────────────────────── */
function ConvItem({
  conv,
  isActive,
  onClick,
}: {
  conv: ConversationItem;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-all ${
        isActive ? "bg-[#155EEF]/8 border-r-2 border-[#155EEF]" : "hover:bg-gray-50"
      }`}
    >
      <TeacherAvatar teacher={conv.teacher} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <p className="truncate text-sm font-semibold text-gray-800">
            {conv.teacher?.name ?? "Teacher"}
          </p>
          <span className="ml-2 shrink-0 text-[11px] text-gray-400">
            {fmtRelativeDate(conv.last_message_at)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-1 mt-0.5">
          <p className="truncate text-xs text-gray-500">
            {conv.teacher?.designation ?? ""}
          </p>
          {conv.parent_unread_count > 0 && (
            <span className="flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-[#155EEF] px-1.5 text-[10px] font-bold text-white">
              {conv.parent_unread_count > 9 ? "9+" : conv.parent_unread_count}
            </span>
          )}
        </div>
        {conv.last_message && (
          <p className="mt-0.5 truncate text-xs text-gray-400">{conv.last_message}</p>
        )}
      </div>
    </button>
  );
}

/* ── New conversation sheet ───────────────────────────────────────── */
function NewConversationSheet({
  teachers,
  loading,
  existingConvTeacherIds,
  studentName,
  className,
  sectionName,
  onSelect,
  onClose,
}: {
  teachers: TeacherProfile[];
  loading: boolean;
  existingConvTeacherIds: Set<string>;
  studentName?: string | null;
  className?: string | null;
  sectionName?: string | null;
  onSelect: (t: TeacherProfile) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const filtered = teachers.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    (t.subject ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  const classTeachers = filtered.filter((t) => t.is_class_teacher);
  const subjectTeachers = filtered.filter((t) => !t.is_class_teacher);
  const hasAssignments = teachers.length > 0;

  // Avoid "Class Class 1 C" — student.class may already include "Class"
  const classLabel = className
    ? `${/^class\s/i.test(className) ? "" : "Class "}${className}${sectionName ? ` ${sectionName}` : ""}`
    : "your child's class";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", damping: 22, stiffness: 300 }}
        className="w-full max-w-md rounded-t-3xl bg-white p-5 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-1 flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-800">Start New Conversation</h3>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        {studentName && (
          <p className="mb-4 text-xs text-gray-400">
            Teachers for{" "}
            <span className="font-semibold text-gray-600">{studentName}</span>
            {className ? ` · ${classLabel}` : ""}
          </p>
        )}

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Search by name or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-4 text-sm focus:border-[#155EEF] focus:outline-none"
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-[#155EEF]" />
            <p className="text-xs text-gray-400">Loading assigned teachers…</p>
          </div>
        ) : !hasAssignments ? (
          <div className="flex flex-col items-center py-10 text-center px-4">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50">
              <MessageSquare className="h-6 w-6 text-amber-400" />
            </div>
            <p className="text-sm font-semibold text-gray-700">No teachers assigned yet</p>
            <p className="mt-1.5 text-xs leading-relaxed text-gray-400">
              No teachers are currently assigned to {classLabel}. Please contact the school
              administration to configure teacher assignments.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">
            No teachers match your search.
          </p>
        ) : (
          <div className="max-h-72 overflow-y-auto space-y-4">
            {/* Class Teacher section */}
            {classTeachers.length > 0 && (
              <div>
                <p className="mb-1.5 px-1 text-[10px] font-bold uppercase tracking-widest text-[#155EEF]">
                  Class Teacher
                </p>
                <ul className="space-y-1">
                  {classTeachers.map((t) => (
                    <TeacherPickerRow
                      key={t.id}
                      teacher={t}
                      hasConversation={existingConvTeacherIds.has(t.id)}
                      onSelect={onSelect}
                    />
                  ))}
                </ul>
              </div>
            )}

            {/* Subject Teachers section */}
            {subjectTeachers.length > 0 && (
              <div>
                <p className="mb-1.5 px-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Subject Teachers
                </p>
                <ul className="space-y-1">
                  {subjectTeachers.map((t) => (
                    <TeacherPickerRow
                      key={t.id}
                      teacher={t}
                      hasConversation={existingConvTeacherIds.has(t.id)}
                      onSelect={onSelect}
                    />
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function TeacherPickerRow({
  teacher,
  hasConversation,
  onSelect,
}: {
  teacher: TeacherProfile;
  hasConversation: boolean;
  onSelect: (t: TeacherProfile) => void;
}) {
  return (
    <li>
      <button
        onClick={() => onSelect(teacher)}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-gray-50"
      >
        <TeacherAvatar teacher={teacher} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-800">{teacher.name}</p>
          <p className="text-xs text-gray-400">
            {teacher.subject
              ? teacher.subject
              : teacher.designation ?? "Teacher"}
          </p>
        </div>
        {hasConversation && (
          <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-[#155EEF]">
            Active
          </span>
        )}
      </button>
    </li>
  );
}

/* ── Message composer ─────────────────────────────────────────────── */
function MessageComposer({
  onSend,
  sending,
}: {
  onSend: (text: string, file?: File | null) => Promise<void>;
  sending: boolean;
}) {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const canSend = (text.trim().length > 0 || !!file) && !sending;

  const handleSend = async () => {
    if (!canSend) return;
    const msg = text.trim();
    setText("");
    setFile(null);
    await onSend(msg || " ", file);
    textRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-gray-100 bg-white px-4 py-3">
      {file && (
        <div className="mb-2 flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2">
          {file.type.startsWith("image/") ? (
            <ImageIcon className="h-4 w-4 shrink-0 text-[#155EEF]" />
          ) : (
            <FileText className="h-4 w-4 shrink-0 text-[#155EEF]" />
          )}
          <span className="min-w-0 flex-1 truncate text-xs font-medium text-[#155EEF]">
            {file.name}
          </span>
          <button onClick={() => setFile(null)} className="shrink-0">
            <X className="h-3.5 w-3.5 text-gray-400 hover:text-red-500" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* Attachment */}
        <button
          onClick={() => fileRef.current?.click()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-400 transition hover:border-[#155EEF] hover:text-[#155EEF]"
          aria-label="Attach file"
        >
          <Paperclip className="h-4 w-4" />
        </button>
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />

        {/* Text input */}
        <textarea
          ref={textRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          className="flex-1 resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-[#155EEF] focus:bg-white focus:outline-none"
          style={{ maxHeight: "120px", overflowY: "auto" }}
          onInput={(e) => {
            const el = e.currentTarget;
            el.style.height = "auto";
            el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
          }}
        />

        {/* Send */}
        <button
          onClick={handleSend}
          disabled={!canSend}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${
            canSend
              ? "bg-[#155EEF] text-white hover:bg-[#1a56db] shadow-md shadow-blue-200"
              : "bg-gray-100 text-gray-300"
          }`}
          aria-label="Send message"
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}

/* ── Chat area (right panel) ──────────────────────────────────────── */
function ChatArea({
  conv,
  messages,
  loading,
  sending,
  parentId,
  onSend,
  onBack,
}: {
  conv: ConversationItem;
  messages: MessageItem[];
  loading: boolean;
  sending: boolean;
  parentId: string;
  onSend: (text: string, file?: File | null) => Promise<void>;
  onBack: () => void;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-100 bg-white px-4 py-3">
        <button
          onClick={onBack}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-gray-100 md:hidden"
        >
          <ArrowLeft className="h-4 w-4 text-gray-500" />
        </button>
        <TeacherAvatar teacher={conv.teacher} size="md" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-gray-900">
            {conv.teacher?.name ?? "Teacher"}
          </p>
          <p className="text-xs text-gray-400">
            {conv.teacher?.designation ?? "Teacher"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto bg-[#F0F4FF] px-4 py-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-[#155EEF]" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
              <MessageSquare className="h-8 w-8 text-[#155EEF]/40" />
            </div>
            <p className="text-sm font-medium text-gray-600">No messages yet</p>
            <p className="mt-1 text-xs text-gray-400">
              Send a message to start the conversation.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} parentId={parentId} />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <MessageComposer onSend={onSend} sending={sending} />
    </div>
  );
}

/* ── Empty state ─────────────────────────────────────────────────── */
function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-8 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#155EEF]/8">
        <MessageSquare className="h-12 w-12 text-[#155EEF]/50" />
      </div>
      <h3 className="mb-2 text-lg font-bold text-gray-800">No conversations yet</h3>
      <p className="mb-6 max-w-xs text-sm text-gray-500 leading-relaxed">
        You can communicate with teachers here regarding academics, attendance,
        assignments and student progress.
      </p>
      <button
        onClick={onNew}
        className="flex items-center gap-2 rounded-xl bg-[#155EEF] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-200 transition hover:bg-[#1a56db]"
      >
        <Plus className="h-4 w-4" />
        Start a Conversation
      </button>
    </div>
  );
}

/* ── Main page ────────────────────────────────────────────────────── */
function CommunicationPage() {
  const { user } = useParentAuth();
  const { student, studentId: ctxStudentId } = useParentDashboardCtx();

  const parentId = user?.id ?? null;
  const studentId = ctxStudentId ?? student?.id ?? null;
  const orgId = student?.organization_id ?? null;

  const {
    conversations,
    activeConversation,
    messages,
    teachers,
    loading,
    messagesLoading,
    teachersLoading,
    sendingMessage,
    openConversation,
    startConversationWithTeacher,
    send,
    loadTeachers,
  } = useParentMessaging({
    parentId,
    studentId,
    orgId,
    className: student?.class ?? null,
    sectionName: student?.section ?? null,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [showNewConv, setShowNewConv] = useState(false);

  // Filter conversations
  const filtered = conversations.filter((c) => {
    const matchesSearch =
      !searchQuery ||
      (c.teacher?.name ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.last_message ?? "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || c.parent_unread_count > 0;
    return matchesSearch && matchesTab;
  });

  const existingTeacherIds = new Set(conversations.map((c) => c.teacher_id));

  const handleOpenConversation = async (convId: string) => {
    await openConversation(convId);
    setShowMobileChat(true);
  };

  const handleOpenNewConv = () => {
    loadTeachers();
    setShowNewConv(true);
  };

  const handleSelectTeacher = async (teacher: TeacherProfile) => {
    setShowNewConv(false);
    await startConversationWithTeacher(teacher);
    setShowMobileChat(true);
  };

  if (!parentId || !orgId) return null;

  return (
    <div className="glass overflow-hidden" style={{ height: "calc(100vh - 72px - 48px)" }}>
      <div className="flex h-full">

        {/* ── Left panel: conversation list ───────────────────────── */}
        <div
          className={`flex h-full w-full flex-col border-r border-gray-100 md:w-[340px] md:shrink-0 ${
            showMobileChat ? "hidden md:flex" : "flex"
          }`}
        >
          {/* List header */}
          <div className="border-b border-gray-100 px-4 pb-3 pt-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">Messages</h2>
              <button
                onClick={handleOpenNewConv}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#155EEF] text-white transition hover:bg-[#1a56db]"
                aria-label="New conversation"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                placeholder="Search teachers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-sm focus:border-[#155EEF] focus:bg-white focus:outline-none"
              />
            </div>

            {/* Tabs */}
            <div className="flex gap-1 rounded-xl bg-gray-100 p-0.5">
              {(["all", "unread"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-semibold capitalize transition ${
                    activeTab === tab
                      ? "bg-white text-[#155EEF] shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab}
                  {tab === "unread" && conversations.filter((c) => c.parent_unread_count > 0).length > 0 && (
                    <span className="ml-1 rounded-full bg-[#155EEF] px-1.5 py-0.5 text-[10px] text-white">
                      {conversations.filter((c) => c.parent_unread_count > 0).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            {loading && conversations.length === 0 ? (
              <div className="space-y-1 p-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl p-3">
                    <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-gray-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-28 animate-pulse rounded bg-gray-200" />
                      <div className="h-3 w-40 animate-pulse rounded bg-gray-200" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-center px-6">
                <MessageSquare className="mb-3 h-10 w-10 text-gray-200" />
                <p className="text-sm font-medium text-gray-500">
                  {searchQuery ? "No conversations match your search" : "No conversations yet"}
                </p>
                {!searchQuery && (
                  <button
                    onClick={handleOpenNewConv}
                    className="mt-3 flex items-center gap-1.5 rounded-xl bg-[#155EEF] px-4 py-2 text-xs font-semibold text-white"
                  >
                    <Plus className="h-3.5 w-3.5" /> New Conversation
                  </button>
                )}
              </div>
            ) : (
              filtered.map((conv) => (
                <ConvItem
                  key={conv.id}
                  conv={conv}
                  isActive={conv.id === activeConversation?.id}
                  onClick={() => handleOpenConversation(conv.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* ── Right panel: chat ────────────────────────────────────── */}
        <div
          className={`flex h-full flex-1 flex-col ${
            showMobileChat ? "flex" : "hidden md:flex"
          }`}
        >
          {activeConversation && parentId ? (
            <ChatArea
              conv={activeConversation}
              messages={messages}
              loading={messagesLoading}
              sending={sendingMessage}
              parentId={parentId}
              onSend={send}
              onBack={() => setShowMobileChat(false)}
            />
          ) : (
            <EmptyState onNew={handleOpenNewConv} />
          )}
        </div>
      </div>

      {/* New conversation modal */}
      <AnimatePresence>
        {showNewConv && (
          <NewConversationSheet
            teachers={teachers}
            loading={teachersLoading}
            existingConvTeacherIds={existingTeacherIds}
            studentName={student?.name}
            className={student?.class}
            sectionName={student?.section}
            onSelect={handleSelectTeacher}
            onClose={() => setShowNewConv(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
