import { parentSupabase } from "@/lib/parent-supabase";

// ── Types ─────────────────────────────────────────────────────────────

export interface TeacherProfile {
  id: string;
  name: string;
  avatar_url: string | null;
  designation: string | null;
  subject?: string | null;
  is_class_teacher?: boolean;
}

export interface ConversationItem {
  id: string;
  teacher_id: string;
  parent_id: string;
  student_id: string;
  organization_id: string;
  conversation_type: string;
  last_message: string | null;
  last_message_at: string | null;
  parent_unread_count: number;
  teacher_unread_count: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  teacher?: TeacherProfile;
}

export interface MessageItem {
  id: string;
  conversation_id: string;
  message: string;
  sender_id: string;
  sender_role: string;
  receiver_id: string;
  receiver_role: string;
  is_read: boolean;
  read_at: string | null;
  status: "sent" | "delivered" | "read";
  attachment_url: string | null;
  student_id: string | null;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

// ── Conversations ────────────────────────────────────────────────────

export async function getConversations(
  parentId: string,
  orgId: string,
): Promise<ConversationItem[]> {
  const { data, error } = await parentSupabase
    .from("conversations")
    .select("*")
    .eq("parent_id", parentId)
    .eq("organization_id", orgId)
    .eq("is_archived", false)
    .order("last_message_at", { ascending: false, nullsFirst: false });

  if (error) throw error;
  const convs = (data ?? []) as ConversationItem[];

  // Hydrate teacher profiles
  const teacherIds = [...new Set(convs.map((c) => c.teacher_id).filter(Boolean))];
  if (teacherIds.length > 0) {
    const { data: profiles } = await parentSupabase
      .from("profiles")
      .select("id, name, avatar_url, designation")
      .in("id", teacherIds);

    const profileMap = new Map(
      ((profiles ?? []) as TeacherProfile[]).map((p) => [p.id, p]),
    );
    return convs.map((c) => ({ ...c, teacher: profileMap.get(c.teacher_id) }));
  }
  return convs;
}

export async function getOrCreateConversation(params: {
  parentId: string;
  teacherId: string;
  studentId: string;
  orgId: string;
}): Promise<ConversationItem> {
  // Check if conversation already exists
  const { data: existing } = await parentSupabase
    .from("conversations")
    .select("*")
    .eq("parent_id", params.parentId)
    .eq("teacher_id", params.teacherId)
    .eq("student_id", params.studentId)
    .eq("is_archived", false)
    .maybeSingle();

  if (existing) return existing as ConversationItem;

  // Create a new conversation
  const { data: created, error } = await parentSupabase
    .from("conversations")
    .insert({
      parent_id: params.parentId,
      teacher_id: params.teacherId,
      student_id: params.studentId,
      organization_id: params.orgId,
      conversation_type: "parent_teacher",
      parent_unread_count: 0,
      teacher_unread_count: 0,
    })
    .select()
    .single();

  if (error) throw error;
  return created as ConversationItem;
}

// ── Messages ─────────────────────────────────────────────────────────

export async function getMessages(conversationId: string): Promise<MessageItem[]> {
  const { data, error } = await parentSupabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as MessageItem[];
}

export async function sendMessage(params: {
  conversationId: string;
  parentId: string;
  teacherId: string;
  studentId: string;
  orgId: string;
  message: string;
  attachmentUrl?: string | null;
}): Promise<MessageItem> {
  // Insert the message
  const { data, error } = await parentSupabase
    .from("messages")
    .insert({
      conversation_id: params.conversationId,
      sender_id: params.parentId,
      sender_role: "parent",
      receiver_id: params.teacherId,
      receiver_role: "teacher",
      message: params.message,
      organization_id: params.orgId,
      student_id: params.studentId,
      attachment_url: params.attachmentUrl ?? null,
      is_read: false,
      status: "sent",
    })
    .select()
    .single();

  if (error) throw error;

  // Update conversation preview (best-effort, don't block)
  parentSupabase
    .from("conversations")
    .update({
      last_message: params.message,
      last_message_at: new Date().toISOString(),
    })
    .eq("id", params.conversationId)
    .then(() => {}); // fire-and-forget

  return data as MessageItem;
}

export async function markConversationRead(
  conversationId: string,
  parentId: string,
): Promise<void> {
  await Promise.all([
    // Mark all incoming (teacher→parent) messages as read
    parentSupabase
      .from("messages")
      .update({ is_read: true, read_at: new Date().toISOString(), status: "read" })
      .eq("conversation_id", conversationId)
      .eq("receiver_id", parentId)
      .eq("receiver_role", "parent")
      .eq("is_read", false),

    // Reset parent unread count on the conversation
    parentSupabase
      .from("conversations")
      .update({ parent_unread_count: 0 })
      .eq("id", conversationId)
      .eq("parent_id", parentId),
  ]);
}

// ── Teacher discovery ─────────────────────────────────────────────────
// Uses the SAME source and SAME class_name format as the CRM-mirrored fetch
// in components/parent/TimetableGrid.tsx — the single source of truth for
// teacher assignments.
//
// REQUIRES these RLS policies to be applied in Supabase:
//   parent_select_timetables       (migration 20260609140000)
//   parent_select_staff_profiles   (migration 20260609120000)
//
// Without these policies, Supabase returns [] silently for parent JWTs.

export async function getTeachersForStudent(
  orgId: string,
  className: string | null | undefined,
  sectionName: string | null | undefined,
): Promise<TeacherProfile[]> {
  // Identical to getTimetable() in parent-data.ts:
  // class_name in DB is stored as combined "Class 1 - C"
  const combined = sectionName ? `${className} - ${sectionName}` : (className ?? "");
  const candidates = [...new Set([combined, className ?? ""].filter(Boolean))];

  console.log("[getTeachersForStudent] starting", { orgId, className, sectionName, candidates });

  const { data, error } = await parentSupabase
    .from("timetables")
    .select("teacher_id, subject, class_name")
    .eq("organization_id", orgId)
    .in("class_name", candidates)
    .not("teacher_id", "is", null);

  console.log("[getTeachersForStudent] timetables result", {
    rows: data?.length ?? 0,
    error: error?.message ?? null,
    sample: (data ?? []).slice(0, 3),
  });

  if (error || !data?.length) return [];

  type TTRow = { teacher_id: string; subject: string | null; class_name: string };
  const rows = data as TTRow[];

  // Prefer rows that contain the section name (more specific match)
  const sectionRows = sectionName
    ? rows.filter((r) => r.class_name === combined)
    : rows;
  const effectiveRows = sectionRows.length > 0 ? sectionRows : rows;

  // Build teacher → subjects map (one teacher may teach multiple subjects)
  const subjectMap = new Map<string, Set<string>>();
  for (const r of effectiveRows) {
    if (!subjectMap.has(r.teacher_id)) subjectMap.set(r.teacher_id, new Set());
    if (r.subject) subjectMap.get(r.teacher_id)!.add(r.subject);
  }

  const teacherIds = [...subjectMap.keys()];
  console.log("[getTeachersForStudent] teacher IDs found", teacherIds);

  const { data: profiles, error: profErr } = await parentSupabase
    .from("profiles")
    .select("id, name, avatar_url, designation")
    .in("id", teacherIds);

  console.log("[getTeachersForStudent] profiles result", {
    count: profiles?.length ?? 0,
    error: profErr?.message ?? null,
  });

  type ProfileRow = { id: string; name: string; avatar_url: string | null; designation: string | null };

  return ((profiles ?? []) as ProfileRow[])
    .map((p) => ({
      ...p,
      subject: [...(subjectMap.get(p.id) ?? [])].join(", ") || null,
      is_class_teacher: false,
    }))
    .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
}

// ── Total unread count (for sidebar badge) ────────────────────────────

export async function getTotalUnreadCount(
  parentId: string,
  orgId: string,
): Promise<number> {
  const { data } = await parentSupabase
    .from("conversations")
    .select("parent_unread_count")
    .eq("parent_id", parentId)
    .eq("organization_id", orgId)
    .eq("is_archived", false);

  return (data ?? []).reduce(
    (sum, c: { parent_unread_count: number }) => sum + (c.parent_unread_count ?? 0),
    0,
  );
}

// ── File attachment upload ─────────────────────────────────────────────

export async function uploadMessageAttachment(
  parentId: string,
  file: File,
): Promise<string> {
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${parentId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error: uploadError } = await parentSupabase.storage
    .from("message-attachments")
    .upload(path, file, { cacheControl: "3600", upsert: false });

  if (uploadError) throw uploadError;

  const { data: signedData } = await parentSupabase.storage
    .from("message-attachments")
    .createSignedUrl(path, 60 * 60 * 24 * 7); // 7-day signed URL

  if (!signedData?.signedUrl) throw new Error("Failed to generate attachment URL");
  return signedData.signedUrl;
}
