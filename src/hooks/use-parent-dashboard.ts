import { useEffect, useState, useCallback } from "react";
import { useParentAuth } from "@/hooks/use-parent-auth";
import {
  getStudentData,
  getStudentByAdmissionNo,
  getAttendanceSummary,
  getFeeSummary,
  getMarksSummary,
  getAssignments,
  getCirculars,
  getOrganization,
  type StudentInfo,
  type AttendanceSummary,
  type FeeSummary,
  type MarksSummary,
  type AssignmentItem,
  type CircularItem,
  type OrganizationInfo,
} from "@/lib/parent-data";
import { parentSupabase } from "@/lib/parent-supabase";

export interface DashboardData {
  student: StudentInfo | null;
  studentId: string | null;       // parent_accounts.student_id — authoritative for fee queries
  organizationId: string | null;  // parent_accounts.organization_id
  organization: OrganizationInfo | null;
  attendance: AttendanceSummary | null;
  fees: FeeSummary | null;
  marks: MarksSummary | null;
  assignments: AssignmentItem[];
  circulars: CircularItem[];
}

// Module-level cache so dashboard data survives route remounts and we don't
// re-fetch (and re-show "Loading…") on every navigation.
const cache: {
  userId: string | null;
  data: DashboardData;
  loaded: boolean;
  inFlight: Promise<void> | null;
  error: string | null;
} = {
  userId: null,
  data: {
    student: null,
    studentId: null,
    organizationId: null,
    organization: null,
    attendance: null,
    fees: null,
    marks: null,
    assignments: [],
    circulars: [],
  },
  loaded: false,
  inFlight: null,
  error: null,
};

export function useParentDashboard() {
  const { user, student: account, loading: authLoading } = useParentAuth();
  const [data, setData] = useState<DashboardData>(cache.data);
  const [loading, setLoading] = useState<boolean>(
    cache.userId === user?.id ? !cache.loaded : true,
  );
  const [error, setError] = useState<string | null>(cache.error);

  const load = useCallback(async () => {
    if (!user) return;
    // De-dupe concurrent loads across remounted components.
    if (cache.userId === user.id && cache.inFlight) {
      await cache.inFlight;
      setData(cache.data);
      setError(cache.error);
      setLoading(false);
      return;
    }
    if (cache.userId === user.id && cache.loaded) {
      setData(cache.data);
      setError(cache.error);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const run = (async () => {
      try {
      // Fetch parent_account joined with student record in one query via FK relationship
      const { data: pa, error: paErr } = await parentSupabase
        .from("parent_accounts")
        .select(`
          student_id,
          organization_id,
          admission_number,
          must_change_password,
          students_or_clients (
            id, organization_id, name, admission_number, class, section,
            roll_number, father_name, mother_name, photo_url, academic_year,
            gender, date_of_birth, blood_group, phone, address,
            transport_opted, transport_route, transport_stop,
            aadhaar_last_four, status
          )
        `)
        .eq("user_id", user.id)
        .maybeSingle();

      if (paErr) throw paErr;
      if (!pa) {
        cache.error = "No student linked to this account.";
        cache.userId = user.id;
        cache.loaded = true;
        return;
      }

      const paTyped = pa as {
        student_id: string;
        organization_id: string;
        admission_number: string;
        // PostgREST may return the embedded record as a single object or an array
        // depending on how the FK relationship is typed in the schema.
        students_or_clients: Record<string, unknown> | Record<string, unknown>[] | null;
      };

      // Normalise: PostgREST returns an array when it can't determine cardinality,
      // but we always want at most one student per parent account.
      const rawSoc = paTyped.students_or_clients;
      const socObject: Record<string, unknown> | null = Array.isArray(rawSoc)
        ? ((rawSoc as Record<string, unknown>[])[0] ?? null)
        : (rawSoc ?? null);

      let studentInfo: Awaited<ReturnType<typeof getStudentData>> =
        (socObject as Awaited<ReturnType<typeof getStudentData>>) ?? null;

      if (!studentInfo && paTyped.student_id) {
        studentInfo = await getStudentData(paTyped.student_id);
      }
      if (!studentInfo && paTyped.admission_number) {
        studentInfo = await getStudentByAdmissionNo(paTyped.admission_number);
      }
      if (!studentInfo) {
        cache.error = "Student record not found.";
        cache.userId = user.id;
        cache.loaded = true;
        return;
      }

      const studentId = paTyped.student_id ?? studentInfo.id;
      let organizationId: string = paTyped.organization_id ?? studentInfo.organization_id;

      const [attendance, fees, marks, assignments, circulars, organization] = await Promise.all([
        getAttendanceSummary(studentId, organizationId).catch(() => null),
        getFeeSummary(studentId, organizationId).catch(() => null),
        getMarksSummary(studentId, organizationId).catch(() => null),
        getAssignments(organizationId, studentInfo.class, studentInfo.section).catch(() => []),
        getCirculars(organizationId, studentInfo.class).catch(() => []),
        getOrganization(organizationId).catch(() => null),
      ]);

        cache.data = {
          student: studentInfo,
          studentId,
          organizationId,
          organization,
          attendance,
          fees,
          marks,
          assignments: assignments ?? [],
          circulars: circulars ?? [],
        };
        cache.error = null;
        cache.userId = user.id;
        cache.loaded = true;
      } catch (e) {
        cache.error = e instanceof Error ? e.message : "Failed to load dashboard";
        cache.userId = user.id;
        cache.loaded = true;
      }
    })();
    cache.inFlight = run;
    await run;
    cache.inFlight = null;
    setData(cache.data);
    setError(cache.error);
    setLoading(false);
  }, [user, account]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      // reset cache on logout
      cache.userId = null;
      cache.loaded = false;
      cache.error = null;
      cache.data = {
        student: null,
        studentId: null,
        organizationId: null,
        organization: null,
        attendance: null,
        fees: null,
        marks: null,
        assignments: [],
        circulars: [],
      };
      setData(cache.data);
      setLoading(false);
      return;
    }
    // Different user → invalidate
    if (cache.userId && cache.userId !== user.id) {
      cache.userId = null;
      cache.loaded = false;
    }
    load();
  }, [authLoading, user, load]);

  return {
    ...data,
    loading,
    error,
    reload: () => {
      cache.loaded = false;
      cache.userId = null;
      return load();
    },
  };
}