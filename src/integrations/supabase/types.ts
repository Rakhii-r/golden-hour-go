export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      absence_alert_settings: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          include_school_logo: boolean
          language: string
          organization_id: string
          reminder_threshold_days: number
          template_en: string
          template_te: string
          threshold_days: number
          updated_at: string
          whatsapp_enabled: boolean
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          include_school_logo?: boolean
          language?: string
          organization_id: string
          reminder_threshold_days?: number
          template_en?: string
          template_te?: string
          threshold_days?: number
          updated_at?: string
          whatsapp_enabled?: boolean
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          include_school_logo?: boolean
          language?: string
          organization_id?: string
          reminder_threshold_days?: number
          template_en?: string
          template_te?: string
          threshold_days?: number
          updated_at?: string
          whatsapp_enabled?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "absence_alert_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      academic_planner_audit: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entry_id: string
          id: string
          organization_id: string
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entry_id: string
          id?: string
          organization_id: string
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entry_id?: string
          id?: string
          organization_id?: string
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "academic_planner_audit_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "academic_planner_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academic_planner_audit_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      academic_planner_entries: {
        Row: {
          academic_year: string
          allow_parents_view: boolean
          allow_students_view: boolean
          attachment_url: string | null
          audience_type: string
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string
          end_time: string | null
          event_subtype: string | null
          event_type: string
          exam_category: string | null
          exam_instructions: string | null
          exam_room: string | null
          holiday_category: string | null
          id: string
          invigilator: string | null
          is_all_day: boolean
          is_important: boolean
          max_marks: number | null
          notification_enabled: boolean
          organization_id: string
          passing_marks: number | null
          priority: string
          publish_later_at: string | null
          publish_status: string
          published_at: string | null
          reminder_config: Json | null
          requires_reminder: boolean
          show_on_dashboard: boolean
          start_date: string
          start_time: string | null
          subject: string | null
          target_classes: string[] | null
          target_sections: string[] | null
          target_staff_ids: string[] | null
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          academic_year: string
          allow_parents_view?: boolean
          allow_students_view?: boolean
          attachment_url?: string | null
          audience_type?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date: string
          end_time?: string | null
          event_subtype?: string | null
          event_type?: string
          exam_category?: string | null
          exam_instructions?: string | null
          exam_room?: string | null
          holiday_category?: string | null
          id?: string
          invigilator?: string | null
          is_all_day?: boolean
          is_important?: boolean
          max_marks?: number | null
          notification_enabled?: boolean
          organization_id: string
          passing_marks?: number | null
          priority?: string
          publish_later_at?: string | null
          publish_status?: string
          published_at?: string | null
          reminder_config?: Json | null
          requires_reminder?: boolean
          show_on_dashboard?: boolean
          start_date: string
          start_time?: string | null
          subject?: string | null
          target_classes?: string[] | null
          target_sections?: string[] | null
          target_staff_ids?: string[] | null
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          academic_year?: string
          allow_parents_view?: boolean
          allow_students_view?: boolean
          attachment_url?: string | null
          audience_type?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string
          end_time?: string | null
          event_subtype?: string | null
          event_type?: string
          exam_category?: string | null
          exam_instructions?: string | null
          exam_room?: string | null
          holiday_category?: string | null
          id?: string
          invigilator?: string | null
          is_all_day?: boolean
          is_important?: boolean
          max_marks?: number | null
          notification_enabled?: boolean
          organization_id?: string
          passing_marks?: number | null
          priority?: string
          publish_later_at?: string | null
          publish_status?: string
          published_at?: string | null
          reminder_config?: Json | null
          requires_reminder?: boolean
          show_on_dashboard?: boolean
          start_date?: string
          start_time?: string | null
          subject?: string | null
          target_classes?: string[] | null
          target_sections?: string[] | null
          target_staff_ids?: string[] | null
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "academic_planner_entries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academic_planner_entries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academic_planner_entries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academic_planner_entries_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academic_planner_entries_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      academic_planner_exam_rows: {
        Row: {
          created_at: string
          display_order: number
          end_time: string | null
          entry_id: string
          exam_date: string
          id: string
          instructions: string | null
          organization_id: string
          room: string | null
          start_time: string | null
          subject: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          end_time?: string | null
          entry_id: string
          exam_date: string
          id?: string
          instructions?: string | null
          organization_id: string
          room?: string | null
          start_time?: string | null
          subject: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          end_time?: string | null
          entry_id?: string
          exam_date?: string
          id?: string
          instructions?: string | null
          organization_id?: string
          room?: string | null
          start_time?: string | null
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "academic_planner_exam_rows_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "academic_planner_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academic_planner_exam_rows_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      admission_audit: {
        Row: {
          action: string
          admission_id: string
          created_at: string
          id: string
          metadata: Json | null
          new_status: string | null
          notes: string | null
          organization_id: string
          previous_status: string | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          action: string
          admission_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          new_status?: string | null
          notes?: string | null
          organization_id: string
          previous_status?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          action?: string
          admission_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          new_status?: string | null
          notes?: string | null
          organization_id?: string
          previous_status?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admission_audit_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      admission_delete_requests: {
        Row: {
          admission_id: string
          created_at: string
          id: string
          organization_id: string
          reason: string
          requested_by: string
          requester_name: string | null
          requester_role: string | null
          review_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_name: string | null
          status: string
          updated_at: string
        }
        Insert: {
          admission_id: string
          created_at?: string
          id?: string
          organization_id: string
          reason: string
          requested_by: string
          requester_name?: string | null
          requester_role?: string | null
          review_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_name?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          admission_id?: string
          created_at?: string
          id?: string
          organization_id?: string
          reason?: string
          requested_by?: string
          requester_name?: string | null
          requester_role?: string | null
          review_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_name?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admission_delete_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      admission_history: {
        Row: {
          action: string
          admission_id: string
          created_at: string
          done_by: string | null
          done_by_name: string | null
          id: string
          new_value: Json | null
          notes: string | null
          old_value: Json | null
          organization_id: string
        }
        Insert: {
          action: string
          admission_id: string
          created_at?: string
          done_by?: string | null
          done_by_name?: string | null
          id?: string
          new_value?: Json | null
          notes?: string | null
          old_value?: Json | null
          organization_id: string
        }
        Update: {
          action?: string
          admission_id?: string
          created_at?: string
          done_by?: string | null
          done_by_name?: string | null
          id?: string
          new_value?: Json | null
          notes?: string | null
          old_value?: Json | null
          organization_id?: string
        }
        Relationships: []
      }
      age_criteria: {
        Row: {
          board_id: string
          class_name: string
          created_at: string
          cutoff_date: string
          description: string | null
          id: string
          max_age_months: number | null
          max_age_years: number | null
          min_age_months: number
          min_age_years: number
          state_id: string | null
          updated_at: string
        }
        Insert: {
          board_id: string
          class_name: string
          created_at?: string
          cutoff_date?: string
          description?: string | null
          id?: string
          max_age_months?: number | null
          max_age_years?: number | null
          min_age_months?: number
          min_age_years: number
          state_id?: string | null
          updated_at?: string
        }
        Update: {
          board_id?: string
          class_name?: string
          created_at?: string
          cutoff_date?: string
          description?: string | null
          id?: string
          max_age_months?: number | null
          max_age_years?: number | null
          min_age_months?: number
          min_age_years?: number
          state_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "age_criteria_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "board_master"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "age_criteria_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "state_master"
            referencedColumns: ["id"]
          },
        ]
      }
      application_delete_requests: {
        Row: {
          application_id: string
          created_at: string
          id: string
          organization_id: string
          reason: string
          requested_by: string
          requester_name: string | null
          requester_role: string | null
          review_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_name: string | null
          status: string
          updated_at: string
        }
        Insert: {
          application_id: string
          created_at?: string
          id?: string
          organization_id: string
          reason: string
          requested_by: string
          requester_name?: string | null
          requester_role?: string | null
          review_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_name?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          application_id?: string
          created_at?: string
          id?: string
          organization_id?: string
          reason?: string
          requested_by?: string
          requester_name?: string | null
          requester_role?: string | null
          review_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_name?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_delete_requests_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_delete_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      application_form_config: {
        Row: {
          created_at: string
          display_order: number
          field_label: string
          field_name: string
          field_type: string
          id: string
          is_enabled: boolean
          is_required: boolean
          options: Json | null
          organization_id: string
          updated_at: string
          validation_rules: Json | null
        }
        Insert: {
          created_at?: string
          display_order?: number
          field_label: string
          field_name: string
          field_type?: string
          id?: string
          is_enabled?: boolean
          is_required?: boolean
          options?: Json | null
          organization_id: string
          updated_at?: string
          validation_rules?: Json | null
        }
        Update: {
          created_at?: string
          display_order?: number
          field_label?: string
          field_name?: string
          field_type?: string
          id?: string
          is_enabled?: boolean
          is_required?: boolean
          options?: Json | null
          organization_id?: string
          updated_at?: string
          validation_rules?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "application_form_config_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      application_history: {
        Row: {
          action: string
          application_id: string
          created_at: string
          done_by: string | null
          done_by_name: string | null
          id: string
          new_value: Json | null
          notes: string | null
          old_value: Json | null
          organization_id: string
        }
        Insert: {
          action: string
          application_id: string
          created_at?: string
          done_by?: string | null
          done_by_name?: string | null
          id?: string
          new_value?: Json | null
          notes?: string | null
          old_value?: Json | null
          organization_id: string
        }
        Update: {
          action?: string
          application_id?: string
          created_at?: string
          done_by?: string | null
          done_by_name?: string | null
          id?: string
          new_value?: Json | null
          notes?: string | null
          old_value?: Json | null
          organization_id?: string
        }
        Relationships: []
      }
      applications: {
        Row: {
          aadhaar_encrypted: string | null
          aadhaar_last_four: string | null
          aadhaar_not_available: boolean | null
          academic_year: string | null
          address: string | null
          age_at_cutoff_months: number | null
          age_at_cutoff_years: number | null
          age_eligible: boolean | null
          applicant_name: string | null
          application_number: string | null
          archived_at: string | null
          archived_by: string | null
          checklist_json: Json | null
          created_at: string
          date_of_birth: string | null
          father_email: string | null
          father_name: string | null
          father_occupation: string | null
          father_phone: string | null
          gender: string | null
          guardian_email: string | null
          guardian_name: string | null
          guardian_phone: string | null
          guardian_relation: string | null
          id: string
          is_archived: boolean
          is_locked: boolean
          is_noc_applied: boolean
          lead_id: string | null
          lock_reason: string | null
          medical_record: Json | null
          medical_report_url: string | null
          mother_email: string | null
          mother_name: string | null
          mother_occupation: string | null
          mother_phone: string | null
          noc_document_url: string | null
          noc_note: string | null
          organization_id: string
          parent_declaration: Json | null
          parent_email: string | null
          parent_name: string | null
          parent_phone: string | null
          parent_relation: string | null
          phone: string | null
          photo_url: string | null
          status: string | null
          transport_opted: boolean
          transport_route: string | null
          transport_stop: string | null
          type: string | null
          updated_at: string
        }
        Insert: {
          aadhaar_encrypted?: string | null
          aadhaar_last_four?: string | null
          aadhaar_not_available?: boolean | null
          academic_year?: string | null
          address?: string | null
          age_at_cutoff_months?: number | null
          age_at_cutoff_years?: number | null
          age_eligible?: boolean | null
          applicant_name?: string | null
          application_number?: string | null
          archived_at?: string | null
          archived_by?: string | null
          checklist_json?: Json | null
          created_at?: string
          date_of_birth?: string | null
          father_email?: string | null
          father_name?: string | null
          father_occupation?: string | null
          father_phone?: string | null
          gender?: string | null
          guardian_email?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          guardian_relation?: string | null
          id?: string
          is_archived?: boolean
          is_locked?: boolean
          is_noc_applied?: boolean
          lead_id?: string | null
          lock_reason?: string | null
          medical_record?: Json | null
          medical_report_url?: string | null
          mother_email?: string | null
          mother_name?: string | null
          mother_occupation?: string | null
          mother_phone?: string | null
          noc_document_url?: string | null
          noc_note?: string | null
          organization_id: string
          parent_declaration?: Json | null
          parent_email?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          parent_relation?: string | null
          phone?: string | null
          photo_url?: string | null
          status?: string | null
          transport_opted?: boolean
          transport_route?: string | null
          transport_stop?: string | null
          type?: string | null
          updated_at?: string
        }
        Update: {
          aadhaar_encrypted?: string | null
          aadhaar_last_four?: string | null
          aadhaar_not_available?: boolean | null
          academic_year?: string | null
          address?: string | null
          age_at_cutoff_months?: number | null
          age_at_cutoff_years?: number | null
          age_eligible?: boolean | null
          applicant_name?: string | null
          application_number?: string | null
          archived_at?: string | null
          archived_by?: string | null
          checklist_json?: Json | null
          created_at?: string
          date_of_birth?: string | null
          father_email?: string | null
          father_name?: string | null
          father_occupation?: string | null
          father_phone?: string | null
          gender?: string | null
          guardian_email?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          guardian_relation?: string | null
          id?: string
          is_archived?: boolean
          is_locked?: boolean
          is_noc_applied?: boolean
          lead_id?: string | null
          lock_reason?: string | null
          medical_record?: Json | null
          medical_report_url?: string | null
          mother_email?: string | null
          mother_name?: string | null
          mother_occupation?: string | null
          mother_phone?: string | null
          noc_document_url?: string | null
          noc_note?: string | null
          organization_id?: string
          parent_declaration?: Json | null
          parent_email?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          parent_relation?: string | null
          phone?: string | null
          photo_url?: string | null
          status?: string | null
          transport_opted?: boolean
          transport_route?: string | null
          transport_stop?: string | null
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      archive_activity_logs: {
        Row: {
          action_at: string
          archive_action: string
          archived_by: string | null
          created_at: string
          id: string
          module_name: string
          notes: string | null
          organization_id: string
          original_record_id: string
          original_table_name: string
          restored_by: string | null
        }
        Insert: {
          action_at?: string
          archive_action: string
          archived_by?: string | null
          created_at?: string
          id?: string
          module_name: string
          notes?: string | null
          organization_id: string
          original_record_id: string
          original_table_name: string
          restored_by?: string | null
        }
        Update: {
          action_at?: string
          archive_action?: string
          archived_by?: string | null
          created_at?: string
          id?: string
          module_name?: string
          notes?: string | null
          organization_id?: string
          original_record_id?: string
          original_table_name?: string
          restored_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "archive_activity_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      archive_settings: {
        Row: {
          archive_after_days: number
          archive_batch_size: number
          auto_archive_enabled: boolean
          created_at: string
          id: string
          module_name: string
          organization_id: string
          restore_allowed_roles: string[]
          updated_at: string
        }
        Insert: {
          archive_after_days?: number
          archive_batch_size?: number
          auto_archive_enabled?: boolean
          created_at?: string
          id?: string
          module_name: string
          organization_id: string
          restore_allowed_roles?: string[]
          updated_at?: string
        }
        Update: {
          archive_after_days?: number
          archive_batch_size?: number
          auto_archive_enabled?: boolean
          created_at?: string
          id?: string
          module_name?: string
          organization_id?: string
          restore_allowed_roles?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "archive_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      archived_admissions: {
        Row: {
          archive_reason: string | null
          archived_at: string
          archived_by: string | null
          id: string
          organization_id: string
          original_created_at: string | null
          original_id: string
          original_updated_at: string | null
          record_data: Json
        }
        Insert: {
          archive_reason?: string | null
          archived_at?: string
          archived_by?: string | null
          id?: string
          organization_id: string
          original_created_at?: string | null
          original_id: string
          original_updated_at?: string | null
          record_data: Json
        }
        Update: {
          archive_reason?: string | null
          archived_at?: string
          archived_by?: string | null
          id?: string
          organization_id?: string
          original_created_at?: string | null
          original_id?: string
          original_updated_at?: string | null
          record_data?: Json
        }
        Relationships: []
      }
      archived_applications: {
        Row: {
          archive_reason: string | null
          archived_at: string
          archived_by: string | null
          id: string
          organization_id: string
          original_created_at: string | null
          original_id: string
          original_updated_at: string | null
          record_data: Json
        }
        Insert: {
          archive_reason?: string | null
          archived_at?: string
          archived_by?: string | null
          id?: string
          organization_id: string
          original_created_at?: string | null
          original_id: string
          original_updated_at?: string | null
          record_data: Json
        }
        Update: {
          archive_reason?: string | null
          archived_at?: string
          archived_by?: string | null
          id?: string
          organization_id?: string
          original_created_at?: string | null
          original_id?: string
          original_updated_at?: string | null
          record_data?: Json
        }
        Relationships: []
      }
      archived_circulars: {
        Row: {
          archive_reason: string | null
          archived_at: string
          archived_by: string | null
          id: string
          organization_id: string
          original_created_at: string | null
          original_id: string
          original_updated_at: string | null
          record_data: Json
        }
        Insert: {
          archive_reason?: string | null
          archived_at?: string
          archived_by?: string | null
          id?: string
          organization_id: string
          original_created_at?: string | null
          original_id: string
          original_updated_at?: string | null
          record_data: Json
        }
        Update: {
          archive_reason?: string | null
          archived_at?: string
          archived_by?: string | null
          id?: string
          organization_id?: string
          original_created_at?: string | null
          original_id?: string
          original_updated_at?: string | null
          record_data?: Json
        }
        Relationships: []
      }
      archived_meetings: {
        Row: {
          archive_reason: string | null
          archived_at: string
          archived_by: string | null
          id: string
          organization_id: string
          original_created_at: string | null
          original_id: string
          original_updated_at: string | null
          record_data: Json
        }
        Insert: {
          archive_reason?: string | null
          archived_at?: string
          archived_by?: string | null
          id?: string
          organization_id: string
          original_created_at?: string | null
          original_id: string
          original_updated_at?: string | null
          record_data: Json
        }
        Update: {
          archive_reason?: string | null
          archived_at?: string
          archived_by?: string | null
          id?: string
          organization_id?: string
          original_created_at?: string | null
          original_id?: string
          original_updated_at?: string | null
          record_data?: Json
        }
        Relationships: []
      }
      archived_organization_data: {
        Row: {
          archived_at: string
          archived_by: string | null
          data: Json
          id: string
          organization_id: string
          row_count: number
          table_name: string
        }
        Insert: {
          archived_at?: string
          archived_by?: string | null
          data?: Json
          id?: string
          organization_id: string
          row_count?: number
          table_name: string
        }
        Update: {
          archived_at?: string
          archived_by?: string | null
          data?: Json
          id?: string
          organization_id?: string
          row_count?: number
          table_name?: string
        }
        Relationships: []
      }
      archived_organizations: {
        Row: {
          archived_at: string
          archived_by: string | null
          created_at: string
          domain: string | null
          id: string
          industry_type: Database["public"]["Enums"]["industry_type"] | null
          name: string
          status: string | null
          updated_at: string
        }
        Insert: {
          archived_at?: string
          archived_by?: string | null
          created_at: string
          domain?: string | null
          id: string
          industry_type?: Database["public"]["Enums"]["industry_type"] | null
          name: string
          status?: string | null
          updated_at: string
        }
        Update: {
          archived_at?: string
          archived_by?: string | null
          created_at?: string
          domain?: string | null
          id?: string
          industry_type?: Database["public"]["Enums"]["industry_type"] | null
          name?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      archived_profiles: {
        Row: {
          archived_at: string
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          name: string
          organization_id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          archived_at?: string
          avatar_url?: string | null
          created_at: string
          email: string
          id: string
          name: string
          organization_id: string
          phone?: string | null
          updated_at: string
        }
        Update: {
          archived_at?: string
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          organization_id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      archived_user_roles: {
        Row: {
          archived_at: string
          id: string
          organization_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          archived_at?: string
          id: string
          organization_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          archived_at?: string
          id?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      assessments: {
        Row: {
          archived_at: string | null
          archived_by: string | null
          assessed_at: string
          created_at: string
          id: string
          is_archived: boolean | null
          organization_id: string
          remark: string | null
          score: number | null
          student_id: string
          subject: string
        }
        Insert: {
          archived_at?: string | null
          archived_by?: string | null
          assessed_at?: string
          created_at?: string
          id?: string
          is_archived?: boolean | null
          organization_id: string
          remark?: string | null
          score?: number | null
          student_id: string
          subject: string
        }
        Update: {
          archived_at?: string | null
          archived_by?: string | null
          assessed_at?: string
          created_at?: string
          id?: string
          is_archived?: boolean | null
          organization_id?: string
          remark?: string | null
          score?: number | null
          student_id?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students_or_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      assignment_submissions: {
        Row: {
          assignment_id: string
          created_at: string
          feedback: string | null
          file_url: string | null
          graded_at: string | null
          id: string
          organization_id: string
          score: number | null
          status: string | null
          student_id: string
          submitted_at: string
          updated_at: string
        }
        Insert: {
          assignment_id: string
          created_at?: string
          feedback?: string | null
          file_url?: string | null
          graded_at?: string | null
          id?: string
          organization_id: string
          score?: number | null
          status?: string | null
          student_id: string
          submitted_at?: string
          updated_at?: string
        }
        Update: {
          assignment_id?: string
          created_at?: string
          feedback?: string | null
          file_url?: string | null
          graded_at?: string | null
          id?: string
          organization_id?: string
          score?: number | null
          status?: string | null
          student_id?: string
          submitted_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignment_submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_submissions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students_or_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          class_name: string
          created_at: string
          description: string | null
          due_date: string
          file_url: string | null
          id: string
          max_score: number
          organization_id: string
          section_name: string | null
          subject: string
          teacher_id: string
          title: string
          updated_at: string
        }
        Insert: {
          class_name: string
          created_at?: string
          description?: string | null
          due_date: string
          file_url?: string | null
          id?: string
          max_score?: number
          organization_id: string
          section_name?: string | null
          subject: string
          teacher_id: string
          title: string
          updated_at?: string
        }
        Update: {
          class_name?: string
          created_at?: string
          description?: string | null
          due_date?: string
          file_url?: string | null
          id?: string
          max_score?: number
          organization_id?: string
          section_name?: string | null
          subject?: string
          teacher_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          academic_year: string
          class_name: string
          created_at: string
          date: string
          id: string
          notes: string | null
          organization_id: string
          period_start_time: string
          status: string
          student_id: string
          subject: string
          teacher_id: string
          updated_at: string
        }
        Insert: {
          academic_year?: string
          class_name: string
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          organization_id: string
          period_start_time?: string
          status: string
          student_id: string
          subject: string
          teacher_id: string
          updated_at?: string
        }
        Update: {
          academic_year?: string
          class_name?: string
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          organization_id?: string
          period_start_time?: string
          status?: string
          student_id?: string
          subject?: string
          teacher_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      attendance_unlock_requests: {
        Row: {
          attendance_date: string
          attendance_id: string | null
          created_at: string
          employee_id: string
          id: string
          organization_id: string
          reason: string
          requested_by: string
          requester_name: string | null
          requester_role: string | null
          review_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_name: string | null
          status: string
          updated_at: string
        }
        Insert: {
          attendance_date: string
          attendance_id?: string | null
          created_at?: string
          employee_id: string
          id?: string
          organization_id: string
          reason: string
          requested_by: string
          requester_name?: string | null
          requester_role?: string | null
          review_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_name?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          attendance_date?: string
          attendance_id?: string | null
          created_at?: string
          employee_id?: string
          id?: string
          organization_id?: string
          reason?: string
          requested_by?: string
          requester_name?: string | null
          requester_role?: string | null
          review_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_name?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_unlock_requests_attendance_id_fkey"
            columns: ["attendance_id"]
            isOneToOne: false
            referencedRelation: "employee_attendance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_unlock_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          entity: string
          entity_id: string | null
          id: string
          metadata: Json | null
          module: string | null
          organization_id: string
          timestamp: string
          user_id: string | null
        }
        Insert: {
          action: string
          entity: string
          entity_id?: string | null
          id?: string
          metadata?: Json | null
          module?: string | null
          organization_id: string
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          entity?: string
          entity_id?: string | null
          id?: string
          metadata?: Json | null
          module?: string | null
          organization_id?: string
          timestamp?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_actions: {
        Row: {
          action_config: Json
          action_type: string
          created_at: string
          execution_order: number
          id: string
          workflow_id: string
        }
        Insert: {
          action_config?: Json
          action_type: string
          created_at?: string
          execution_order?: number
          id?: string
          workflow_id: string
        }
        Update: {
          action_config?: Json
          action_type?: string
          created_at?: string
          execution_order?: number
          id?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_actions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "automation_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_executions: {
        Row: {
          completed_at: string | null
          created_at: string
          entity_id: string
          entity_type: string
          error_message: string | null
          execution_data: Json | null
          id: string
          organization_id: string
          started_at: string | null
          status: string
          trigger_data: Json | null
          workflow_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          entity_id: string
          entity_type: string
          error_message?: string | null
          execution_data?: Json | null
          id?: string
          organization_id: string
          started_at?: string | null
          status?: string
          trigger_data?: Json | null
          workflow_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          error_message?: string | null
          execution_data?: Json | null
          id?: string
          organization_id?: string
          started_at?: string | null
          status?: string
          trigger_data?: Json | null
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_executions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_executions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "automation_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_workflows: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          organization_id: string
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          trigger_config: Json
          trigger_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          organization_id: string
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          trigger_config?: Json
          trigger_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          organization_id?: string
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          trigger_config?: Json
          trigger_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_workflows_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_change_requests: {
        Row: {
          approved_by: string | null
          approved_role: string | null
          created_at: string
          employee_id: string
          id: string
          new_bank_data: Json
          old_bank_id: string | null
          organization_id: string
          rejection_reason: string | null
          requested_at: string
          resolved_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          approved_by?: string | null
          approved_role?: string | null
          created_at?: string
          employee_id: string
          id?: string
          new_bank_data: Json
          old_bank_id?: string | null
          organization_id: string
          rejection_reason?: string | null
          requested_at?: string
          resolved_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          approved_by?: string | null
          approved_role?: string | null
          created_at?: string
          employee_id?: string
          id?: string
          new_bank_data?: Json
          old_bank_id?: string | null
          organization_id?: string
          rejection_reason?: string | null
          requested_at?: string
          resolved_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_change_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_change_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_change_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_change_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_change_requests_old_bank_id_fkey"
            columns: ["old_bank_id"]
            isOneToOne: false
            referencedRelation: "employee_bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_change_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      billing: {
        Row: {
          billing_cycle: string
          created_at: string
          current_period_end: string
          current_period_start: string
          id: string
          organization_id: string
          plan_amount: number
          plan_name: string
          status: string
          updated_at: string
        }
        Insert: {
          billing_cycle?: string
          created_at?: string
          current_period_end: string
          current_period_start?: string
          id?: string
          organization_id: string
          plan_amount?: number
          plan_name: string
          status?: string
          updated_at?: string
        }
        Update: {
          billing_cycle?: string
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          organization_id?: string
          plan_amount?: number
          plan_name?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_payments: {
        Row: {
          amount: number
          billing_cycle: string
          created_at: string
          id: string
          installment_number: number | null
          invoice_url: string | null
          organization_id: string
          paid_at: string | null
          payment_method: string | null
          payment_note: string | null
          payment_type: string
          plan_id: string | null
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          recorded_by: string | null
          status: string
          subscription_id: string | null
          total_installments: number | null
          trace_id: string | null
        }
        Insert: {
          amount?: number
          billing_cycle?: string
          created_at?: string
          id?: string
          installment_number?: number | null
          invoice_url?: string | null
          organization_id: string
          paid_at?: string | null
          payment_method?: string | null
          payment_note?: string | null
          payment_type?: string
          plan_id?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          recorded_by?: string | null
          status?: string
          subscription_id?: string | null
          total_installments?: number | null
          trace_id?: string | null
        }
        Update: {
          amount?: number
          billing_cycle?: string
          created_at?: string
          id?: string
          installment_number?: number | null
          invoice_url?: string | null
          organization_id?: string
          paid_at?: string | null
          payment_method?: string | null
          payment_note?: string | null
          payment_type?: string
          plan_id?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          recorded_by?: string | null
          status?: string
          subscription_id?: string | null
          total_installments?: number | null
          trace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_payments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_payments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "organization_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      board_configurations: {
        Row: {
          academic_session: string | null
          additional_config: Json | null
          affiliation_number: string | null
          age_cutoff_date: string | null
          board_id: string
          correction_window_days: number | null
          created_at: string
          exam_pattern: string | null
          id: string
          is_active: boolean
          late_fee_rules: Json | null
          organization_id: string
          registration_deadline: Json | null
          school_code: string | null
          state_id: string | null
          udise_code: string | null
          updated_at: string
        }
        Insert: {
          academic_session?: string | null
          additional_config?: Json | null
          affiliation_number?: string | null
          age_cutoff_date?: string | null
          board_id: string
          correction_window_days?: number | null
          created_at?: string
          exam_pattern?: string | null
          id?: string
          is_active?: boolean
          late_fee_rules?: Json | null
          organization_id: string
          registration_deadline?: Json | null
          school_code?: string | null
          state_id?: string | null
          udise_code?: string | null
          updated_at?: string
        }
        Update: {
          academic_session?: string | null
          additional_config?: Json | null
          affiliation_number?: string | null
          age_cutoff_date?: string | null
          board_id?: string
          correction_window_days?: number | null
          created_at?: string
          exam_pattern?: string | null
          id?: string
          is_active?: boolean
          late_fee_rules?: Json | null
          organization_id?: string
          registration_deadline?: Json | null
          school_code?: string | null
          state_id?: string | null
          udise_code?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "board_configurations_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "board_master"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "board_configurations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "board_configurations_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "state_master"
            referencedColumns: ["id"]
          },
        ]
      }
      board_master: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      bulk_employee_id_card_generations: {
        Row: {
          created_at: string
          download_type: string | null
          generated_by: string | null
          generated_pdf_url: string | null
          id: string
          layout: string | null
          organization_id: string
          selected_theme: string | null
          side: string | null
          total_employees: number
        }
        Insert: {
          created_at?: string
          download_type?: string | null
          generated_by?: string | null
          generated_pdf_url?: string | null
          id?: string
          layout?: string | null
          organization_id: string
          selected_theme?: string | null
          side?: string | null
          total_employees?: number
        }
        Update: {
          created_at?: string
          download_type?: string | null
          generated_by?: string | null
          generated_pdf_url?: string | null
          id?: string
          layout?: string | null
          organization_id?: string
          selected_theme?: string | null
          side?: string | null
          total_employees?: number
        }
        Relationships: []
      }
      bulk_id_card_generations: {
        Row: {
          created_at: string
          download_type: string | null
          generated_by: string | null
          generated_pdf_url: string | null
          id: string
          layout: string | null
          organization_id: string
          selected_theme: string | null
          side: string | null
          total_students: number
        }
        Insert: {
          created_at?: string
          download_type?: string | null
          generated_by?: string | null
          generated_pdf_url?: string | null
          id?: string
          layout?: string | null
          organization_id: string
          selected_theme?: string | null
          side?: string | null
          total_students?: number
        }
        Update: {
          created_at?: string
          download_type?: string | null
          generated_by?: string | null
          generated_pdf_url?: string | null
          id?: string
          layout?: string | null
          organization_id?: string
          selected_theme?: string | null
          side?: string | null
          total_students?: number
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          budget: number | null
          created_at: string
          end_date: string | null
          id: string
          name: string
          organization_id: string
          performance_json: Json | null
          platform: string | null
          start_date: string | null
          updated_at: string
        }
        Insert: {
          budget?: number | null
          created_at?: string
          end_date?: string | null
          id?: string
          name: string
          organization_id: string
          performance_json?: Json | null
          platform?: string | null
          start_date?: string | null
          updated_at?: string
        }
        Update: {
          budget?: number | null
          created_at?: string
          end_date?: string | null
          id?: string
          name?: string
          organization_id?: string
          performance_json?: Json | null
          platform?: string | null
          start_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      circular_recipients: {
        Row: {
          circular_id: string
          created_at: string
          id: string
          is_read: boolean
          read_at: string | null
          user_id: string
        }
        Insert: {
          circular_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          read_at?: string | null
          user_id: string
        }
        Update: {
          circular_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "circular_recipients_circular_id_fkey"
            columns: ["circular_id"]
            isOneToOne: false
            referencedRelation: "circulars"
            referencedColumns: ["id"]
          },
        ]
      }
      circulars: {
        Row: {
          archived_at: string | null
          archived_by: string | null
          attachment_url: string | null
          created_at: string
          created_by: string
          description: string
          id: string
          is_archived: boolean
          organization_id: string
          scheduled_at: string | null
          status: string
          target_classes: string[] | null
          target_departments: string[] | null
          target_roles: string[]
          title: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          archived_by?: string | null
          attachment_url?: string | null
          created_at?: string
          created_by: string
          description: string
          id?: string
          is_archived?: boolean
          organization_id: string
          scheduled_at?: string | null
          status?: string
          target_classes?: string[] | null
          target_departments?: string[] | null
          target_roles?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          archived_by?: string | null
          attachment_url?: string | null
          created_at?: string
          created_by?: string
          description?: string
          id?: string
          is_archived?: boolean
          organization_id?: string
          scheduled_at?: string | null
          status?: string
          target_classes?: string[] | null
          target_departments?: string[] | null
          target_roles?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      class_sections: {
        Row: {
          class_name: string
          created_at: string
          id: string
          is_system_generated: boolean
          organization_id: string
          section_name: string
          updated_at: string
        }
        Insert: {
          class_name: string
          created_at?: string
          id?: string
          is_system_generated?: boolean
          organization_id: string
          section_name: string
          updated_at?: string
        }
        Update: {
          class_name?: string
          created_at?: string
          id?: string
          is_system_generated?: boolean
          organization_id?: string
          section_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_sections_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      class_subjects: {
        Row: {
          class_section_id: string
          created_at: string
          id: string
          organization_id: string
          subject_id: string
        }
        Insert: {
          class_section_id: string
          created_at?: string
          id?: string
          organization_id: string
          subject_id: string
        }
        Update: {
          class_section_id?: string
          created_at?: string
          id?: string
          organization_id?: string
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_subjects_class_section_id_fkey"
            columns: ["class_section_id"]
            isOneToOne: false
            referencedRelation: "class_sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_subjects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_subjects_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      class_teachers: {
        Row: {
          academic_year: string
          assigned_by: string | null
          class_name: string
          created_at: string
          id: string
          organization_id: string
          section_name: string
          teacher_id: string
          updated_at: string
        }
        Insert: {
          academic_year: string
          assigned_by?: string | null
          class_name: string
          created_at?: string
          id?: string
          organization_id: string
          section_name: string
          teacher_id: string
          updated_at?: string
        }
        Update: {
          academic_year?: string
          assigned_by?: string | null
          class_name?: string
          created_at?: string
          id?: string
          organization_id?: string
          section_name?: string
          teacher_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_teachers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      classes_or_services: {
        Row: {
          created_at: string
          id: string
          name: string
          organization_id: string
          owner_id: string | null
          progress_json: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          organization_id: string
          owner_id?: string | null
          progress_json?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          organization_id?: string
          owner_id?: string | null
          progress_json?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classes_or_services_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_notes: {
        Row: {
          class_name: string | null
          coach_id: string
          created_at: string
          id: string
          note: string
          note_date: string
          organization_id: string
          student_id: string | null
          updated_at: string
        }
        Insert: {
          class_name?: string | null
          coach_id: string
          created_at?: string
          id?: string
          note: string
          note_date?: string
          organization_id: string
          student_id?: string | null
          updated_at?: string
        }
        Update: {
          class_name?: string | null
          coach_id?: string
          created_at?: string
          id?: string
          note?: string
          note_date?: string
          organization_id?: string
          student_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_notes_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students_or_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      communications: {
        Row: {
          channel: Database["public"]["Enums"]["communication_channel"]
          created_at: string
          id: string
          message: string
          organization_id: string
          sent_at: string | null
          status: string | null
          to_user: string | null
        }
        Insert: {
          channel: Database["public"]["Enums"]["communication_channel"]
          created_at?: string
          id?: string
          message: string
          organization_id: string
          sent_at?: string | null
          status?: string | null
          to_user?: string | null
        }
        Update: {
          channel?: Database["public"]["Enums"]["communication_channel"]
          created_at?: string
          id?: string
          message?: string
          organization_id?: string
          sent_at?: string | null
          status?: string | null
          to_user?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_escalations: {
        Row: {
          assigned_admin_id: string | null
          conversation_id: string
          created_at: string
          escalated_at: string
          escalated_by: string
          escalated_by_role: string
          escalation_reason: string
          id: string
          organization_id: string
          resolution_note: string | null
          resolved_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          assigned_admin_id?: string | null
          conversation_id: string
          created_at?: string
          escalated_at?: string
          escalated_by: string
          escalated_by_role: string
          escalation_reason: string
          id?: string
          organization_id: string
          resolution_note?: string | null
          resolved_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_admin_id?: string | null
          conversation_id?: string
          created_at?: string
          escalated_at?: string
          escalated_by?: string
          escalated_by_role?: string
          escalation_reason?: string
          id?: string
          organization_id?: string
          resolution_note?: string | null
          resolved_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_escalations_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_escalations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          admin_id: string | null
          conversation_type: string
          created_at: string
          id: string
          is_archived: boolean
          last_message: string | null
          last_message_at: string | null
          organization_id: string
          parent_id: string
          parent_unread_count: number
          student_id: string
          teacher_id: string | null
          teacher_unread_count: number
          updated_at: string
        }
        Insert: {
          admin_id?: string | null
          conversation_type?: string
          created_at?: string
          id?: string
          is_archived?: boolean
          last_message?: string | null
          last_message_at?: string | null
          organization_id: string
          parent_id: string
          parent_unread_count?: number
          student_id: string
          teacher_id?: string | null
          teacher_unread_count?: number
          updated_at?: string
        }
        Update: {
          admin_id?: string | null
          conversation_type?: string
          created_at?: string
          id?: string
          is_archived?: boolean
          last_message?: string | null
          last_message_at?: string | null
          organization_id?: string
          parent_id?: string
          parent_unread_count?: number
          student_id?: string
          teacher_id?: string | null
          teacher_unread_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students_or_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      core_roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          permissions: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          permissions?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          permissions?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      custom_document_themes: {
        Row: {
          asset_paths: string[]
          created_at: string
          created_by: string | null
          description: string | null
          html_content: string | null
          id: string
          is_active: boolean
          module_type: string
          organization_id: string
          preview_thumbnail_path: string | null
          reference_pdf_path: string | null
          theme_name: string
          theme_type: string | null
          updated_at: string
        }
        Insert: {
          asset_paths?: string[]
          created_at?: string
          created_by?: string | null
          description?: string | null
          html_content?: string | null
          id?: string
          is_active?: boolean
          module_type: string
          organization_id: string
          preview_thumbnail_path?: string | null
          reference_pdf_path?: string | null
          theme_name: string
          theme_type?: string | null
          updated_at?: string
        }
        Update: {
          asset_paths?: string[]
          created_at?: string
          created_by?: string | null
          description?: string | null
          html_content?: string | null
          id?: string
          is_active?: boolean
          module_type?: string
          organization_id?: string
          preview_thumbnail_path?: string | null
          reference_pdf_path?: string | null
          theme_name?: string
          theme_type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      daily_timetable: {
        Row: {
          class_name: string
          created_at: string
          date: string
          day_of_week: string | null
          end_time: string
          id: string
          organization_id: string
          period_label: string
          period_type: string | null
          section_name: string | null
          source: string
          start_time: string
          status: string
          subject: string | null
          substitution_id: string | null
          teacher_id: string | null
          updated_at: string
        }
        Insert: {
          class_name: string
          created_at?: string
          date: string
          day_of_week?: string | null
          end_time: string
          id?: string
          organization_id: string
          period_label: string
          period_type?: string | null
          section_name?: string | null
          source?: string
          start_time: string
          status?: string
          subject?: string | null
          substitution_id?: string | null
          teacher_id?: string | null
          updated_at?: string
        }
        Update: {
          class_name?: string
          created_at?: string
          date?: string
          day_of_week?: string | null
          end_time?: string
          id?: string
          organization_id?: string
          period_label?: string
          period_type?: string | null
          section_name?: string | null
          source?: string
          start_time?: string
          status?: string
          subject?: string | null
          substitution_id?: string | null
          teacher_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_timetable_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_timetable_substitution_id_fkey"
            columns: ["substitution_id"]
            isOneToOne: false
            referencedRelation: "substitutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_timetable_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_timetable_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daycare_enrollments: {
        Row: {
          created_at: string
          daycare_student_id: string
          end_date: string | null
          id: string
          organization_id: string
          plan_id: string | null
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          daycare_student_id: string
          end_date?: string | null
          id?: string
          organization_id: string
          plan_id?: string | null
          start_date?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          daycare_student_id?: string
          end_date?: string | null
          id?: string
          organization_id?: string
          plan_id?: string | null
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daycare_enrollments_daycare_student_id_fkey"
            columns: ["daycare_student_id"]
            isOneToOne: false
            referencedRelation: "daycare_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daycare_enrollments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "daycare_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      daycare_fee_overrides: {
        Row: {
          approved_by: string | null
          created_at: string
          daycare_student_id: string
          difference: number | null
          effective_from: string
          effective_to: string | null
          id: string
          organization_id: string
          original_amount: number
          override_amount: number
          override_type: string
          plan_id: string | null
          reason: string | null
          updated_at: string
        }
        Insert: {
          approved_by?: string | null
          created_at?: string
          daycare_student_id: string
          difference?: number | null
          effective_from?: string
          effective_to?: string | null
          id?: string
          organization_id: string
          original_amount?: number
          override_amount?: number
          override_type: string
          plan_id?: string | null
          reason?: string | null
          updated_at?: string
        }
        Update: {
          approved_by?: string | null
          created_at?: string
          daycare_student_id?: string
          difference?: number | null
          effective_from?: string
          effective_to?: string | null
          id?: string
          organization_id?: string
          original_amount?: number
          override_amount?: number
          override_type?: string
          plan_id?: string | null
          reason?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daycare_fee_overrides_daycare_student_id_fkey"
            columns: ["daycare_student_id"]
            isOneToOne: false
            referencedRelation: "daycare_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daycare_fee_overrides_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "daycare_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      daycare_invoices: {
        Row: {
          balance_amount: number | null
          created_at: string
          daycare_student_id: string
          due_date: string | null
          id: string
          invoice_number: string | null
          notes: string | null
          organization_id: string
          paid_amount: number
          period_end: string
          period_start: string
          plan_id: string | null
          status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          balance_amount?: number | null
          created_at?: string
          daycare_student_id: string
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          notes?: string | null
          organization_id: string
          paid_amount?: number
          period_end: string
          period_start: string
          plan_id?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          balance_amount?: number | null
          created_at?: string
          daycare_student_id?: string
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          notes?: string | null
          organization_id?: string
          paid_amount?: number
          period_end?: string
          period_start?: string
          plan_id?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daycare_invoices_daycare_student_id_fkey"
            columns: ["daycare_student_id"]
            isOneToOne: false
            referencedRelation: "daycare_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daycare_invoices_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "daycare_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      daycare_payments: {
        Row: {
          amount: number
          collected_by: string | null
          created_at: string
          daycare_student_id: string
          id: string
          invoice_id: string | null
          notes: string | null
          organization_id: string
          paid_on: string
          payment_mode: string
          receipt_no: string | null
          reference_no: string | null
          updated_at: string
        }
        Insert: {
          amount?: number
          collected_by?: string | null
          created_at?: string
          daycare_student_id: string
          id?: string
          invoice_id?: string | null
          notes?: string | null
          organization_id: string
          paid_on?: string
          payment_mode?: string
          receipt_no?: string | null
          reference_no?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          collected_by?: string | null
          created_at?: string
          daycare_student_id?: string
          id?: string
          invoice_id?: string | null
          notes?: string | null
          organization_id?: string
          paid_on?: string
          payment_mode?: string
          receipt_no?: string | null
          reference_no?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daycare_payments_daycare_student_id_fkey"
            columns: ["daycare_student_id"]
            isOneToOne: false
            referencedRelation: "daycare_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daycare_payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "daycare_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      daycare_plans: {
        Row: {
          created_at: string
          description: string | null
          duration_hours: number | null
          fee_amount: number
          id: string
          is_active: boolean
          name: string
          organization_id: string
          plan_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_hours?: number | null
          fee_amount?: number
          id?: string
          is_active?: boolean
          name: string
          organization_id: string
          plan_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_hours?: number | null
          fee_amount?: number
          id?: string
          is_active?: boolean
          name?: string
          organization_id?: string
          plan_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      daycare_settings: {
        Row: {
          capacity: number
          created_at: string
          daycare_name: string
          id: string
          notify_on_admission: boolean
          notify_on_payment: boolean
          organization_id: string
          receipt_prefix: string
          reminder_days_before: number
          updated_at: string
          working_hours_end: string
          working_hours_start: string
        }
        Insert: {
          capacity?: number
          created_at?: string
          daycare_name?: string
          id?: string
          notify_on_admission?: boolean
          notify_on_payment?: boolean
          organization_id: string
          receipt_prefix?: string
          reminder_days_before?: number
          updated_at?: string
          working_hours_end?: string
          working_hours_start?: string
        }
        Update: {
          capacity?: number
          created_at?: string
          daycare_name?: string
          id?: string
          notify_on_admission?: boolean
          notify_on_payment?: boolean
          organization_id?: string
          receipt_prefix?: string
          reminder_days_before?: number
          updated_at?: string
          working_hours_end?: string
          working_hours_start?: string
        }
        Relationships: []
      }
      daycare_students: {
        Row: {
          address: string | null
          admission_number: string | null
          alt_mobile: string | null
          child_name: string
          class: string | null
          created_at: string
          dob: string | null
          emergency_contact: string | null
          gender: string | null
          id: string
          linked_student_id: string | null
          medical_notes: string | null
          mobile: string | null
          organization_id: string
          parent_name: string | null
          section: string | null
          status: string
          student_type: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          admission_number?: string | null
          alt_mobile?: string | null
          child_name: string
          class?: string | null
          created_at?: string
          dob?: string | null
          emergency_contact?: string | null
          gender?: string | null
          id?: string
          linked_student_id?: string | null
          medical_notes?: string | null
          mobile?: string | null
          organization_id: string
          parent_name?: string | null
          section?: string | null
          status?: string
          student_type: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          admission_number?: string | null
          alt_mobile?: string | null
          child_name?: string
          class?: string | null
          created_at?: string
          dob?: string | null
          emergency_contact?: string | null
          gender?: string | null
          id?: string
          linked_student_id?: string | null
          medical_notes?: string | null
          mobile?: string | null
          organization_id?: string
          parent_name?: string | null
          section?: string | null
          status?: string
          student_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      default_age_framework: {
        Row: {
          class_name: string
          created_at: string
          cutoff_date: string
          id: string
          is_system_default: boolean
          max_age: number
          min_age: number
          updated_at: string
        }
        Insert: {
          class_name: string
          created_at?: string
          cutoff_date?: string
          id?: string
          is_system_default?: boolean
          max_age: number
          min_age: number
          updated_at?: string
        }
        Update: {
          class_name?: string
          created_at?: string
          cutoff_date?: string
          id?: string
          is_system_default?: boolean
          max_age?: number
          min_age?: number
          updated_at?: string
        }
        Relationships: []
      }
      document_themes: {
        Row: {
          created_at: string
          document_type: string
          id: string
          organization_id: string
          selected_theme: string
          template_content: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          document_type: string
          id?: string
          organization_id: string
          selected_theme: string
          template_content?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          document_type?: string
          id?: string
          organization_id?: string
          selected_theme?: string
          template_content?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      email_message_logs: {
        Row: {
          created_at: string | null
          customer_id: string | null
          email_status: string | null
          error_message: string | null
          html_body: string | null
          id: string
          metadata: Json | null
          organization_id: string
          recipient_name: string | null
          related_module: string | null
          related_record_id: string | null
          sendgrid_message_id: string | null
          sent_by: string | null
          subject: string
          template_key: string | null
          text_body: string | null
          to_email: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          email_status?: string | null
          error_message?: string | null
          html_body?: string | null
          id?: string
          metadata?: Json | null
          organization_id: string
          recipient_name?: string | null
          related_module?: string | null
          related_record_id?: string | null
          sendgrid_message_id?: string | null
          sent_by?: string | null
          subject: string
          template_key?: string | null
          text_body?: string | null
          to_email: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          email_status?: string | null
          error_message?: string | null
          html_body?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string
          recipient_name?: string | null
          related_module?: string | null
          related_record_id?: string | null
          sendgrid_message_id?: string | null
          sent_by?: string | null
          subject?: string
          template_key?: string | null
          text_body?: string | null
          to_email?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_message_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      email_status_events: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          organization_id: string | null
          raw_payload: Json
          recipient_email: string | null
          sendgrid_message_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          organization_id?: string | null
          raw_payload: Json
          recipient_email?: string | null
          sendgrid_message_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          organization_id?: string | null
          raw_payload?: Json
          recipient_email?: string | null
          sendgrid_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_status_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          created_at: string | null
          html_body: string
          id: string
          is_active: boolean | null
          organization_id: string
          subject: string
          template_key: string
          template_name: string
          text_body: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          html_body: string
          id?: string
          is_active?: boolean | null
          organization_id: string
          subject: string
          template_key: string
          template_name: string
          text_body?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          html_body?: string
          id?: string
          is_active?: boolean | null
          organization_id?: string
          subject?: string
          template_key?: string
          template_name?: string
          text_body?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_attendance: {
        Row: {
          approved_by: string | null
          attendance_date: string
          check_in_time: string | null
          check_out_time: string | null
          created_at: string
          created_by: string | null
          employee_id: string
          id: string
          is_locked: boolean
          locked_at: string | null
          locked_by: string | null
          notes: string | null
          organization_id: string
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          approved_by?: string | null
          attendance_date?: string
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string
          created_by?: string | null
          employee_id: string
          id?: string
          is_locked?: boolean
          locked_at?: string | null
          locked_by?: string | null
          notes?: string | null
          organization_id: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          approved_by?: string | null
          attendance_date?: string
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string
          created_by?: string | null
          employee_id?: string
          id?: string
          is_locked?: boolean
          locked_at?: string | null
          locked_by?: string | null
          notes?: string | null
          organization_id?: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_attendance_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_attendance_audit: {
        Row: {
          action: string
          attendance_id: string | null
          created_at: string
          details: Json | null
          id: string
          new_status: string | null
          organization_id: string
          performed_by: string | null
          previous_status: string | null
        }
        Insert: {
          action: string
          attendance_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          new_status?: string | null
          organization_id: string
          performed_by?: string | null
          previous_status?: string | null
        }
        Update: {
          action?: string
          attendance_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          new_status?: string | null
          organization_id?: string
          performed_by?: string | null
          previous_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_attendance_audit_attendance_id_fkey"
            columns: ["attendance_id"]
            isOneToOne: false
            referencedRelation: "employee_attendance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_attendance_audit_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_bank_accounts: {
        Row: {
          account_holder_name: string
          account_number: string
          account_type: string
          bank_address: string | null
          bank_name: string
          branch_name: string
          created_at: string
          employee_id: string
          id: string
          ifsc_code: string
          is_primary: boolean
          is_verified: boolean
          organization_id: string
          status: string
          swift_code: string | null
          updated_at: string
        }
        Insert: {
          account_holder_name: string
          account_number: string
          account_type?: string
          bank_address?: string | null
          bank_name: string
          branch_name: string
          created_at?: string
          employee_id: string
          id?: string
          ifsc_code: string
          is_primary?: boolean
          is_verified?: boolean
          organization_id: string
          status?: string
          swift_code?: string | null
          updated_at?: string
        }
        Update: {
          account_holder_name?: string
          account_number?: string
          account_type?: string
          bank_address?: string | null
          bank_name?: string
          branch_name?: string
          created_at?: string
          employee_id?: string
          id?: string
          ifsc_code?: string
          is_primary?: boolean
          is_verified?: boolean
          organization_id?: string
          status?: string
          swift_code?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_bank_accounts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_bank_accounts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_bank_accounts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_certificates: {
        Row: {
          cancellation_reason: string | null
          certificate_type: string
          content_html: string
          created_at: string
          employee_id: string
          id: string
          issue_date: string
          issued_by: string | null
          organization_id: string
          reference_no: string
          reprint_count: number
          status: string
          updated_at: string
        }
        Insert: {
          cancellation_reason?: string | null
          certificate_type: string
          content_html: string
          created_at?: string
          employee_id: string
          id?: string
          issue_date?: string
          issued_by?: string | null
          organization_id: string
          reference_no: string
          reprint_count?: number
          status?: string
          updated_at?: string
        }
        Update: {
          cancellation_reason?: string | null
          certificate_type?: string
          content_html?: string
          created_at?: string
          employee_id?: string
          id?: string
          issue_date?: string
          issued_by?: string | null
          organization_id?: string
          reference_no?: string
          reprint_count?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_certificates_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_certificates_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_certificates_issued_by_fkey"
            columns: ["issued_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_certificates_issued_by_fkey"
            columns: ["issued_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_certificates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_documents: {
        Row: {
          aadhaar_number: string | null
          created_at: string
          document_title: string
          document_type: string
          employee_id: string
          file_url: string
          id: string
          organization_id: string
          remarks: string | null
          status: string
          updated_at: string
          uploaded_by: string | null
          verified: boolean
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          aadhaar_number?: string | null
          created_at?: string
          document_title: string
          document_type: string
          employee_id: string
          file_url: string
          id?: string
          organization_id: string
          remarks?: string | null
          status?: string
          updated_at?: string
          uploaded_by?: string | null
          verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          aadhaar_number?: string | null
          created_at?: string
          document_title?: string
          document_type?: string
          employee_id?: string
          file_url?: string
          id?: string
          organization_id?: string
          remarks?: string | null
          status?: string
          updated_at?: string
          uploaded_by?: string | null
          verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_documents_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_documents_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_absence_alert_history: {
        Row: {
          actor_id: string | null
          alert_id: string
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          note: string | null
          organization_id: string
          student_id: string | null
        }
        Insert: {
          actor_id?: string | null
          alert_id: string
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          note?: string | null
          organization_id: string
          student_id?: string | null
        }
        Update: {
          actor_id?: string | null
          alert_id?: string
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          note?: string | null
          organization_id?: string
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_absence_alert_history_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "exam_absence_alerts"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_absence_alerts: {
        Row: {
          academic_year: string | null
          class_name: string | null
          created_at: string
          exam_date: string
          exam_name: string | null
          exam_type_id: string | null
          follow_up_at: string | null
          follow_up_note: string | null
          id: string
          marked_at: string
          marked_by: string | null
          marks_entry_id: string
          notification_channel: string | null
          organization_id: string
          parent_notified_at: string | null
          reason: string | null
          resolved_at: string | null
          resolved_by: string | null
          section: string | null
          status: string
          student_id: string
          subject: string
          updated_at: string
          whatsapp_message_sid: string | null
        }
        Insert: {
          academic_year?: string | null
          class_name?: string | null
          created_at?: string
          exam_date?: string
          exam_name?: string | null
          exam_type_id?: string | null
          follow_up_at?: string | null
          follow_up_note?: string | null
          id?: string
          marked_at?: string
          marked_by?: string | null
          marks_entry_id: string
          notification_channel?: string | null
          organization_id: string
          parent_notified_at?: string | null
          reason?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          section?: string | null
          status?: string
          student_id: string
          subject: string
          updated_at?: string
          whatsapp_message_sid?: string | null
        }
        Update: {
          academic_year?: string | null
          class_name?: string | null
          created_at?: string
          exam_date?: string
          exam_name?: string | null
          exam_type_id?: string | null
          follow_up_at?: string | null
          follow_up_note?: string | null
          id?: string
          marked_at?: string
          marked_by?: string | null
          marks_entry_id?: string
          notification_channel?: string | null
          organization_id?: string
          parent_notified_at?: string | null
          reason?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          section?: string | null
          status?: string
          student_id?: string
          subject?: string
          updated_at?: string
          whatsapp_message_sid?: string | null
        }
        Relationships: []
      }
      exam_patterns: {
        Row: {
          applicable_classes: string[] | null
          board_id: string
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          max_marks: number
          pattern_code: string
          pattern_name: string
          state_id: string | null
          updated_at: string
          weightage_percent: number | null
        }
        Insert: {
          applicable_classes?: string[] | null
          board_id: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          max_marks?: number
          pattern_code: string
          pattern_name: string
          state_id?: string | null
          updated_at?: string
          weightage_percent?: number | null
        }
        Update: {
          applicable_classes?: string[] | null
          board_id?: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          max_marks?: number
          pattern_code?: string
          pattern_name?: string
          state_id?: string | null
          updated_at?: string
          weightage_percent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_patterns_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "board_master"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_patterns_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "state_master"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_types: {
        Row: {
          academic_year: string
          code: string
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          max_marks: number
          name: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          academic_year: string
          code: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          max_marks?: number
          name: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          academic_year?: string
          code?: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          max_marks?: number
          name?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_types_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          approval_remarks: string | null
          approved_at: string | null
          approved_by: string | null
          category: string
          class_name: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_rejection_reason: string | null
          deletion_request_reason: string | null
          deletion_requested_at: string | null
          deletion_requested_by: string | null
          description: string | null
          expense_date: string
          id: string
          is_deleted: boolean
          organization_id: string
          paid_amount: number
          payment_mode: string
          receipt_url: string | null
          status: string
          tally_last_synced_at: string | null
          tally_ledger_name: string | null
          tally_reference_id: string | null
          tally_sync_error: string | null
          tally_sync_status: string | null
          tally_voucher_number: string | null
          title: string
          updated_at: string
        }
        Insert: {
          amount: number
          approval_remarks?: string | null
          approved_at?: string | null
          approved_by?: string | null
          category: string
          class_name?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_rejection_reason?: string | null
          deletion_request_reason?: string | null
          deletion_requested_at?: string | null
          deletion_requested_by?: string | null
          description?: string | null
          expense_date?: string
          id?: string
          is_deleted?: boolean
          organization_id: string
          paid_amount?: number
          payment_mode?: string
          receipt_url?: string | null
          status?: string
          tally_last_synced_at?: string | null
          tally_ledger_name?: string | null
          tally_reference_id?: string | null
          tally_sync_error?: string | null
          tally_sync_status?: string | null
          tally_voucher_number?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          amount?: number
          approval_remarks?: string | null
          approved_at?: string | null
          approved_by?: string | null
          category?: string
          class_name?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_rejection_reason?: string | null
          deletion_request_reason?: string | null
          deletion_requested_at?: string | null
          deletion_requested_by?: string | null
          description?: string | null
          expense_date?: string
          id?: string
          is_deleted?: boolean
          organization_id?: string
          paid_amount?: number
          payment_mode?: string
          receipt_url?: string | null
          status?: string
          tally_last_synced_at?: string | null
          tally_ledger_name?: string | null
          tally_reference_id?: string | null
          tally_sync_error?: string | null
          tally_sync_status?: string | null
          tally_voucher_number?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          enabled: boolean
          flag_key: string
          id: string
          organization_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          enabled?: boolean
          flag_key: string
          id?: string
          organization_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          enabled?: boolean
          flag_key?: string
          id?: string
          organization_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      fee_audit_log: {
        Row: {
          created_at: string
          created_by: string | null
          details: Json
          event_type: string
          id: string
          organization_id: string
          override_id: string | null
          payment_id: string | null
          student_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          details?: Json
          event_type: string
          id?: string
          organization_id: string
          override_id?: string | null
          payment_id?: string | null
          student_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          details?: Json
          event_type?: string
          id?: string
          organization_id?: string
          override_id?: string | null
          payment_id?: string | null
          student_id?: string | null
        }
        Relationships: []
      }
      fee_backfill_log: {
        Row: {
          created_at: string
          id: string
          items_total: number | null
          message: string | null
          organization_id: string
          override_id: string
          override_total: number | null
          status: string
          terms_total: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          items_total?: number | null
          message?: string | null
          organization_id: string
          override_id: string
          override_total?: number | null
          status: string
          terms_total?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          items_total?: number | null
          message?: string | null
          organization_id?: string
          override_id?: string
          override_total?: number | null
          status?: string
          terms_total?: number | null
        }
        Relationships: []
      }
      fee_heads: {
        Row: {
          category: string
          created_at: string
          deleted_at: string | null
          description: string | null
          display_order: number
          fee_head_code: string | null
          fee_head_name: string
          id: string
          is_active: boolean
          is_recurring: boolean
          organization_id: string
          tally_ledger_name: string | null
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          display_order?: number
          fee_head_code?: string | null
          fee_head_name: string
          id?: string
          is_active?: boolean
          is_recurring?: boolean
          organization_id: string
          tally_ledger_name?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          display_order?: number
          fee_head_code?: string | null
          fee_head_name?: string
          id?: string
          is_active?: boolean
          is_recurring?: boolean
          organization_id?: string
          tally_ledger_name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fee_heads_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_notifications: {
        Row: {
          channel: string
          created_at: string
          delivery_status: string
          id: string
          installment_id: string | null
          message_body: string
          notification_type: string
          organization_id: string
          sent_at: string
          sent_to: string | null
          student_id: string
        }
        Insert: {
          channel?: string
          created_at?: string
          delivery_status?: string
          id?: string
          installment_id?: string | null
          message_body: string
          notification_type?: string
          organization_id: string
          sent_at?: string
          sent_to?: string | null
          student_id: string
        }
        Update: {
          channel?: string
          created_at?: string
          delivery_status?: string
          id?: string
          installment_id?: string | null
          message_body?: string
          notification_type?: string
          organization_id?: string
          sent_at?: string
          sent_to?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fee_notifications_installment_id_fkey"
            columns: ["installment_id"]
            isOneToOne: false
            referencedRelation: "student_fee_terms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_notifications_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students_or_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_payments: {
        Row: {
          academic_year: string
          allocation_notes: string | null
          allocation_resolved_at: string | null
          allocation_resolved_by: string | null
          allocation_status: string | null
          amount: number
          billing_type: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_rejection_reason: string | null
          deletion_request_reason: string | null
          deletion_requested_at: string | null
          deletion_requested_by: string | null
          discount_amount: number | null
          fee_head_id: string | null
          id: string
          installment_id: string | null
          is_deleted: boolean
          late_fee_amount: number | null
          notes: string | null
          organization_id: string
          payment_date: string
          payment_link_id: string | null
          payment_mode: string
          receipt_number: string | null
          status: string
          student_id: string
          tally_last_synced_at: string | null
          tally_reference_id: string | null
          tally_sync_error: string | null
          tally_sync_status: string | null
          tally_voucher_number: string | null
          term_number: number | null
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          academic_year?: string
          allocation_notes?: string | null
          allocation_resolved_at?: string | null
          allocation_resolved_by?: string | null
          allocation_status?: string | null
          amount: number
          billing_type?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_rejection_reason?: string | null
          deletion_request_reason?: string | null
          deletion_requested_at?: string | null
          deletion_requested_by?: string | null
          discount_amount?: number | null
          fee_head_id?: string | null
          id?: string
          installment_id?: string | null
          is_deleted?: boolean
          late_fee_amount?: number | null
          notes?: string | null
          organization_id: string
          payment_date?: string
          payment_link_id?: string | null
          payment_mode?: string
          receipt_number?: string | null
          status?: string
          student_id: string
          tally_last_synced_at?: string | null
          tally_reference_id?: string | null
          tally_sync_error?: string | null
          tally_sync_status?: string | null
          tally_voucher_number?: string | null
          term_number?: number | null
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          academic_year?: string
          allocation_notes?: string | null
          allocation_resolved_at?: string | null
          allocation_resolved_by?: string | null
          allocation_status?: string | null
          amount?: number
          billing_type?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_rejection_reason?: string | null
          deletion_request_reason?: string | null
          deletion_requested_at?: string | null
          deletion_requested_by?: string | null
          discount_amount?: number | null
          fee_head_id?: string | null
          id?: string
          installment_id?: string | null
          is_deleted?: boolean
          late_fee_amount?: number | null
          notes?: string | null
          organization_id?: string
          payment_date?: string
          payment_link_id?: string | null
          payment_mode?: string
          receipt_number?: string | null
          status?: string
          student_id?: string
          tally_last_synced_at?: string | null
          tally_reference_id?: string | null
          tally_sync_error?: string | null
          tally_sync_status?: string | null
          tally_voucher_number?: string | null
          term_number?: number | null
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fee_payments_fee_head_id_fkey"
            columns: ["fee_head_id"]
            isOneToOne: false
            referencedRelation: "fee_heads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_payments_installment_id_fkey"
            columns: ["installment_id"]
            isOneToOne: false
            referencedRelation: "student_fee_terms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_payments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_payments_payment_link_id_fkey"
            columns: ["payment_link_id"]
            isOneToOne: false
            referencedRelation: "payment_links"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students_or_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_structure: {
        Row: {
          academic_year: string
          base_annual_fee: number | null
          billing_type: string
          class: string
          created_at: string
          hours_per_day: number | null
          id: string
          monthly_fee: number | null
          organization_id: string
          per_day_rate: number | null
          per_hour_rate: number | null
          section: string | null
          tuition_fee: number
          updated_at: string
          working_days: number | null
        }
        Insert: {
          academic_year?: string
          base_annual_fee?: number | null
          billing_type?: string
          class: string
          created_at?: string
          hours_per_day?: number | null
          id?: string
          monthly_fee?: number | null
          organization_id: string
          per_day_rate?: number | null
          per_hour_rate?: number | null
          section?: string | null
          tuition_fee: number
          updated_at?: string
          working_days?: number | null
        }
        Update: {
          academic_year?: string
          base_annual_fee?: number | null
          billing_type?: string
          class?: string
          created_at?: string
          hours_per_day?: number | null
          id?: string
          monthly_fee?: number | null
          organization_id?: string
          per_day_rate?: number | null
          per_hour_rate?: number | null
          section?: string | null
          tuition_fee?: number
          updated_at?: string
          working_days?: number | null
        }
        Relationships: []
      }
      fee_structure_items: {
        Row: {
          academic_year: string | null
          amount: number
          created_at: string
          due_date: string | null
          fee_head_id: string
          fee_structure_id: string
          id: string
          is_mandatory: boolean
          organization_id: string
          updated_at: string
        }
        Insert: {
          academic_year?: string | null
          amount?: number
          created_at?: string
          due_date?: string | null
          fee_head_id: string
          fee_structure_id: string
          id?: string
          is_mandatory?: boolean
          organization_id: string
          updated_at?: string
        }
        Update: {
          academic_year?: string | null
          amount?: number
          created_at?: string
          due_date?: string | null
          fee_head_id?: string
          fee_structure_id?: string
          id?: string
          is_mandatory?: boolean
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fee_structure_items_fee_head_id_fkey"
            columns: ["fee_head_id"]
            isOneToOne: false
            referencedRelation: "fee_heads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_structure_items_fee_structure_id_fkey"
            columns: ["fee_structure_id"]
            isOneToOne: false
            referencedRelation: "fee_structure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_structure_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      google_sheets_auto_sync: {
        Row: {
          created_at: string
          enabled: boolean
          failed_attempts: number
          id: string
          interval_minutes: number
          last_checked: string | null
          last_error: string | null
          last_row_imported: number | null
          next_check: string | null
          organization_id: string
          sheet_url: string
          unique_id_column: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          failed_attempts?: number
          id?: string
          interval_minutes?: number
          last_checked?: string | null
          last_error?: string | null
          last_row_imported?: number | null
          next_check?: string | null
          organization_id: string
          sheet_url: string
          unique_id_column?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          failed_attempts?: number
          id?: string
          interval_minutes?: number
          last_checked?: string | null
          last_error?: string | null
          last_row_imported?: number | null
          next_check?: string | null
          organization_id?: string
          sheet_url?: string
          unique_id_column?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "google_sheets_auto_sync_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      google_sheets_sync_logs: {
        Row: {
          auto_sync_id: string
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          leads_imported: number
          leads_skipped: number
          leads_updated: number
          organization_id: string
          started_at: string
          status: string
          sync_type: string
        }
        Insert: {
          auto_sync_id: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          leads_imported?: number
          leads_skipped?: number
          leads_updated?: number
          organization_id: string
          started_at?: string
          status: string
          sync_type: string
        }
        Update: {
          auto_sync_id?: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          leads_imported?: number
          leads_skipped?: number
          leads_updated?: number
          organization_id?: string
          started_at?: string
          status?: string
          sync_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "google_sheets_sync_logs_auto_sync_id_fkey"
            columns: ["auto_sync_id"]
            isOneToOne: false
            referencedRelation: "google_sheets_auto_sync"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "google_sheets_sync_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      grade_rules: {
        Row: {
          board_id: string
          created_at: string
          display_order: number
          grade: string
          grade_label: string | null
          grade_point: number | null
          id: string
          max_percentage: number
          min_percentage: number
          state_id: string | null
          updated_at: string
        }
        Insert: {
          board_id: string
          created_at?: string
          display_order?: number
          grade: string
          grade_label?: string | null
          grade_point?: number | null
          id?: string
          max_percentage: number
          min_percentage: number
          state_id?: string | null
          updated_at?: string
        }
        Update: {
          board_id?: string
          created_at?: string
          display_order?: number
          grade?: string
          grade_label?: string | null
          grade_point?: number | null
          id?: string
          max_percentage?: number
          min_percentage?: number
          state_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "grade_rules_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "board_master"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grade_rules_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "state_master"
            referencedColumns: ["id"]
          },
        ]
      }
      grade_scales: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          grade: string
          id: string
          is_active: boolean
          max_percentage: number
          min_percentage: number
          organization_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          grade: string
          id?: string
          is_active?: boolean
          max_percentage: number
          min_percentage: number
          organization_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          grade?: string
          id?: string
          is_active?: boolean
          max_percentage?: number
          min_percentage?: number
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "grade_scales_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      health_injuries: {
        Row: {
          created_at: string
          id: string
          injury_date: string
          injury_type: string
          notes: string | null
          organization_id: string
          recovery_date: string | null
          reported_by: string
          severity: string
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          injury_date?: string
          injury_type: string
          notes?: string | null
          organization_id: string
          recovery_date?: string | null
          reported_by: string
          severity?: string
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          injury_date?: string
          injury_type?: string
          notes?: string | null
          organization_id?: string
          recovery_date?: string | null
          reported_by?: string
          severity?: string
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_injuries_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students_or_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      holiday_ranges: {
        Row: {
          applies_to: string
          blocks_month: boolean
          created_at: string
          description: string | null
          end_date: string
          holiday_type: string
          id: string
          is_active: boolean
          name: string
          organization_id: string
          start_date: string
          updated_at: string
        }
        Insert: {
          applies_to?: string
          blocks_month?: boolean
          created_at?: string
          description?: string | null
          end_date: string
          holiday_type?: string
          id?: string
          is_active?: boolean
          name: string
          organization_id: string
          start_date: string
          updated_at?: string
        }
        Update: {
          applies_to?: string
          blocks_month?: boolean
          created_at?: string
          description?: string | null
          end_date?: string
          holiday_type?: string
          id?: string
          is_active?: boolean
          name?: string
          organization_id?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      holidays: {
        Row: {
          applies_to: string
          created_at: string | null
          description: string | null
          holiday_date: string
          holiday_name: string
          holiday_type: string
          id: string
          is_active: boolean | null
          organization_id: string
          source_planner_id: string | null
          updated_at: string | null
        }
        Insert: {
          applies_to?: string
          created_at?: string | null
          description?: string | null
          holiday_date: string
          holiday_name: string
          holiday_type?: string
          id?: string
          is_active?: boolean | null
          organization_id: string
          source_planner_id?: string | null
          updated_at?: string | null
        }
        Update: {
          applies_to?: string
          created_at?: string | null
          description?: string | null
          holiday_date?: string
          holiday_name?: string
          holiday_type?: string
          id?: string
          is_active?: boolean | null
          organization_id?: string
          source_planner_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "holidays_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_credentials: {
        Row: {
          auto_sync: boolean | null
          created_at: string
          credentials: Json
          id: string
          organization_id: string
          platform: string
          updated_at: string
        }
        Insert: {
          auto_sync?: boolean | null
          created_at?: string
          credentials?: Json
          id?: string
          organization_id: string
          platform: string
          updated_at?: string
        }
        Update: {
          auto_sync?: boolean | null
          created_at?: string
          credentials?: Json
          id?: string
          organization_id?: string
          platform?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_credentials_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_to: string | null
          campaign_id: string | null
          created_at: string
          deleted_at: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          organization_id: string
          phone: string | null
          score: number | null
          source: Database["public"]["Enums"]["lead_source"]
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          campaign_id?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          organization_id: string
          phone?: string | null
          score?: number | null
          source?: Database["public"]["Enums"]["lead_source"]
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          campaign_id?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          organization_id?: string
          phone?: string | null
          score?: number | null
          source?: Database["public"]["Enums"]["lead_source"]
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          actor_name: string | null
          created_at: string
          details: Json | null
          id: string
          leave_id: string | null
          organization_id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_name?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          leave_id?: string | null
          organization_id: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_name?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          leave_id?: string | null
          organization_id?: string
        }
        Relationships: []
      }
      leave_balances: {
        Row: {
          created_at: string
          id: string
          leave_type: string
          organization_id: string
          remaining_leaves: number
          total_allowed: number
          updated_at: string
          used_leaves: number
          user_id: string
          year: number
        }
        Insert: {
          created_at?: string
          id?: string
          leave_type?: string
          organization_id: string
          remaining_leaves?: number
          total_allowed?: number
          updated_at?: string
          used_leaves?: number
          user_id: string
          year?: number
        }
        Update: {
          created_at?: string
          id?: string
          leave_type?: string
          organization_id?: string
          remaining_leaves?: number
          total_allowed?: number
          updated_at?: string
          used_leaves?: number
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "leave_balances_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_documents: {
        Row: {
          file_name: string | null
          file_url: string
          id: string
          leave_id: string
          uploaded_at: string
        }
        Insert: {
          file_name?: string | null
          file_url: string
          id?: string
          leave_id: string
          uploaded_at?: string
        }
        Update: {
          file_name?: string | null
          file_url?: string
          id?: string
          leave_id?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_documents_leave_id_fkey"
            columns: ["leave_id"]
            isOneToOne: false
            referencedRelation: "leaves"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_extensions: {
        Row: {
          additional_days: number
          created_at: string
          id: string
          leave_id: string
          new_end_date: string
          organization_id: string
          original_end_date: string
          reason: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          additional_days?: number
          created_at?: string
          id?: string
          leave_id: string
          new_end_date: string
          organization_id: string
          original_end_date: string
          reason: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          additional_days?: number
          created_at?: string
          id?: string
          leave_id?: string
          new_end_date?: string
          organization_id?: string
          original_end_date?: string
          reason?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_extensions_leave_id_fkey"
            columns: ["leave_id"]
            isOneToOne: false
            referencedRelation: "leaves"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_policies: {
        Row: {
          block_negative_balance: boolean
          block_overlapping: boolean
          block_public_holiday: boolean
          created_at: string
          enforce_holiday_month_block: boolean
          enforce_monthly_limit: boolean
          max_leaves_per_month: number
          organization_id: string
          override_roles: string[]
          updated_at: string
        }
        Insert: {
          block_negative_balance?: boolean
          block_overlapping?: boolean
          block_public_holiday?: boolean
          created_at?: string
          enforce_holiday_month_block?: boolean
          enforce_monthly_limit?: boolean
          max_leaves_per_month?: number
          organization_id: string
          override_roles?: string[]
          updated_at?: string
        }
        Update: {
          block_negative_balance?: boolean
          block_overlapping?: boolean
          block_public_holiday?: boolean
          created_at?: string
          enforce_holiday_month_block?: boolean
          enforce_monthly_limit?: boolean
          max_leaves_per_month?: number
          organization_id?: string
          override_roles?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      leave_settings: {
        Row: {
          allow_carry_forward: boolean
          allow_half_day: boolean
          casual_allow_future_dates: boolean
          casual_allow_past_dates: boolean
          casual_leave_enabled: boolean
          casual_leave_per_month: number
          created_at: string
          default_working_days_per_month: number
          id: string
          max_days_per_request: number
          no_paid_leave_bonus_enabled: boolean
          organization_id: string
          permission_max_duration_minutes: number
          permission_monthly_limit: number
          permission_system_enabled: boolean
          require_approval: boolean
          sick_allow_future_dates: boolean
          sick_allow_past_dates: boolean
          sick_leave_enabled: boolean
          sick_leave_per_month: number
          unpaid_allow_future_dates: boolean
          unpaid_allow_past_dates: boolean
          unpaid_leave_enabled: boolean
          updated_at: string
        }
        Insert: {
          allow_carry_forward?: boolean
          allow_half_day?: boolean
          casual_allow_future_dates?: boolean
          casual_allow_past_dates?: boolean
          casual_leave_enabled?: boolean
          casual_leave_per_month?: number
          created_at?: string
          default_working_days_per_month?: number
          id?: string
          max_days_per_request?: number
          no_paid_leave_bonus_enabled?: boolean
          organization_id: string
          permission_max_duration_minutes?: number
          permission_monthly_limit?: number
          permission_system_enabled?: boolean
          require_approval?: boolean
          sick_allow_future_dates?: boolean
          sick_allow_past_dates?: boolean
          sick_leave_enabled?: boolean
          sick_leave_per_month?: number
          unpaid_allow_future_dates?: boolean
          unpaid_allow_past_dates?: boolean
          unpaid_leave_enabled?: boolean
          updated_at?: string
        }
        Update: {
          allow_carry_forward?: boolean
          allow_half_day?: boolean
          casual_allow_future_dates?: boolean
          casual_allow_past_dates?: boolean
          casual_leave_enabled?: boolean
          casual_leave_per_month?: number
          created_at?: string
          default_working_days_per_month?: number
          id?: string
          max_days_per_request?: number
          no_paid_leave_bonus_enabled?: boolean
          organization_id?: string
          permission_max_duration_minutes?: number
          permission_monthly_limit?: number
          permission_system_enabled?: boolean
          require_approval?: boolean
          sick_allow_future_dates?: boolean
          sick_allow_past_dates?: boolean
          sick_leave_enabled?: boolean
          sick_leave_per_month?: number
          unpaid_allow_future_dates?: boolean
          unpaid_allow_past_dates?: boolean
          unpaid_leave_enabled?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_types: {
        Row: {
          academic_year_limit: boolean
          allow_half_day: boolean
          applies_to: string
          auto_approve: boolean
          carry_forward: boolean
          code: string
          color: string
          created_at: string
          description: string | null
          document_required: boolean
          id: string
          ignore_holiday_month_block: boolean
          ignore_monthly_restriction: boolean
          is_active: boolean
          is_paid: boolean
          is_system: boolean
          max_consecutive_days: number | null
          max_days_per_year: number | null
          min_advance_days: number
          name: string
          organization_id: string
          salary_deduction_enabled: boolean
          sort_order: number
          updated_at: string
        }
        Insert: {
          academic_year_limit?: boolean
          allow_half_day?: boolean
          applies_to?: string
          auto_approve?: boolean
          carry_forward?: boolean
          code: string
          color?: string
          created_at?: string
          description?: string | null
          document_required?: boolean
          id?: string
          ignore_holiday_month_block?: boolean
          ignore_monthly_restriction?: boolean
          is_active?: boolean
          is_paid?: boolean
          is_system?: boolean
          max_consecutive_days?: number | null
          max_days_per_year?: number | null
          min_advance_days?: number
          name: string
          organization_id: string
          salary_deduction_enabled?: boolean
          sort_order?: number
          updated_at?: string
        }
        Update: {
          academic_year_limit?: boolean
          allow_half_day?: boolean
          applies_to?: string
          auto_approve?: boolean
          carry_forward?: boolean
          code?: string
          color?: string
          created_at?: string
          description?: string | null
          document_required?: boolean
          id?: string
          ignore_holiday_month_block?: boolean
          ignore_monthly_restriction?: boolean
          is_active?: boolean
          is_paid?: boolean
          is_system?: boolean
          max_consecutive_days?: number | null
          max_days_per_year?: number | null
          min_advance_days?: number
          name?: string
          organization_id?: string
          salary_deduction_enabled?: boolean
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      leaves: {
        Row: {
          applied_at: string
          approved_at: string | null
          approved_by: string | null
          attendance_mark: string | null
          created_at: string
          document_url: string | null
          emergency_contact: string | null
          end_date: string
          half_day: string | null
          half_day_period: string | null
          id: string
          is_paid: boolean | null
          leave_type: string
          leave_type_id: string | null
          lop_days: number | null
          notes: string | null
          organization_id: string
          original_requested_days: number | null
          policy_overridden_by: string | null
          reason: string | null
          rejection_reason: string | null
          role: string
          sandwich_applied: boolean
          sandwich_days: number
          start_date: string
          status: string
          substitute_user_id: string | null
          total_days: number
          updated_at: string
          user_id: string
          user_name: string
          working_days_count: number | null
        }
        Insert: {
          applied_at?: string
          approved_at?: string | null
          approved_by?: string | null
          attendance_mark?: string | null
          created_at?: string
          document_url?: string | null
          emergency_contact?: string | null
          end_date: string
          half_day?: string | null
          half_day_period?: string | null
          id?: string
          is_paid?: boolean | null
          leave_type?: string
          leave_type_id?: string | null
          lop_days?: number | null
          notes?: string | null
          organization_id: string
          original_requested_days?: number | null
          policy_overridden_by?: string | null
          reason?: string | null
          rejection_reason?: string | null
          role?: string
          sandwich_applied?: boolean
          sandwich_days?: number
          start_date: string
          status?: string
          substitute_user_id?: string | null
          total_days?: number
          updated_at?: string
          user_id: string
          user_name: string
          working_days_count?: number | null
        }
        Update: {
          applied_at?: string
          approved_at?: string | null
          approved_by?: string | null
          attendance_mark?: string | null
          created_at?: string
          document_url?: string | null
          emergency_contact?: string | null
          end_date?: string
          half_day?: string | null
          half_day_period?: string | null
          id?: string
          is_paid?: boolean | null
          leave_type?: string
          leave_type_id?: string | null
          lop_days?: number | null
          notes?: string | null
          organization_id?: string
          original_requested_days?: number | null
          policy_overridden_by?: string | null
          reason?: string | null
          rejection_reason?: string | null
          role?: string
          sandwich_applied?: boolean
          sandwich_days?: number
          start_date?: string
          status?: string
          substitute_user_id?: string | null
          total_days?: number
          updated_at?: string
          user_id?: string
          user_name?: string
          working_days_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "leaves_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_plans: {
        Row: {
          class_name: string
          created_at: string
          day_of_week: string
          description: string | null
          file_url: string | null
          id: string
          organization_id: string
          subject: string
          teacher_id: string
          title: string
          updated_at: string
          week_start_date: string
        }
        Insert: {
          class_name: string
          created_at?: string
          day_of_week: string
          description?: string | null
          file_url?: string | null
          id?: string
          organization_id: string
          subject: string
          teacher_id: string
          title: string
          updated_at?: string
          week_start_date: string
        }
        Update: {
          class_name?: string
          created_at?: string
          day_of_week?: string
          description?: string | null
          file_url?: string | null
          id?: string
          organization_id?: string
          subject?: string
          teacher_id?: string
          title?: string
          updated_at?: string
          week_start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_plans_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      marks_audit_log: {
        Row: {
          action: string
          changed_at: string
          changed_by: string
          details: Json | null
          id: string
          marks_entry_id: string | null
          new_value: number | null
          organization_id: string
          previous_value: number | null
        }
        Insert: {
          action: string
          changed_at?: string
          changed_by: string
          details?: Json | null
          id?: string
          marks_entry_id?: string | null
          new_value?: number | null
          organization_id: string
          previous_value?: number | null
        }
        Update: {
          action?: string
          changed_at?: string
          changed_by?: string
          details?: Json | null
          id?: string
          marks_entry_id?: string | null
          new_value?: number | null
          organization_id?: string
          previous_value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "marks_audit_log_marks_entry_id_fkey"
            columns: ["marks_entry_id"]
            isOneToOne: false
            referencedRelation: "marks_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marks_audit_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      marks_edit_audit: {
        Row: {
          academic_year: string
          class_name: string
          created_at: string
          edited_by: string
          edited_role: string | null
          exam_type_id: string
          id: string
          new_absent: boolean | null
          new_marks: number | null
          old_absent: boolean | null
          old_marks: number | null
          organization_id: string
          previous_status: string
          section: string
          student_id: string
          subject: string
        }
        Insert: {
          academic_year: string
          class_name: string
          created_at?: string
          edited_by: string
          edited_role?: string | null
          exam_type_id: string
          id?: string
          new_absent?: boolean | null
          new_marks?: number | null
          old_absent?: boolean | null
          old_marks?: number | null
          organization_id: string
          previous_status?: string
          section: string
          student_id: string
          subject: string
        }
        Update: {
          academic_year?: string
          class_name?: string
          created_at?: string
          edited_by?: string
          edited_role?: string | null
          exam_type_id?: string
          id?: string
          new_absent?: boolean | null
          new_marks?: number | null
          old_absent?: boolean | null
          old_marks?: number | null
          organization_id?: string
          previous_status?: string
          section?: string
          student_id?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "marks_edit_audit_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      marks_entries: {
        Row: {
          academic_year: string
          archived_at: string | null
          archived_by: string | null
          class_name: string
          created_at: string
          exam_type_id: string
          id: string
          is_absent: boolean
          is_archived: boolean | null
          marks_obtained: number | null
          max_marks: number
          organization_id: string
          remarks: string | null
          section: string | null
          student_id: string
          subject: string
          teacher_id: string
          updated_at: string
        }
        Insert: {
          academic_year: string
          archived_at?: string | null
          archived_by?: string | null
          class_name: string
          created_at?: string
          exam_type_id: string
          id?: string
          is_absent?: boolean
          is_archived?: boolean | null
          marks_obtained?: number | null
          max_marks?: number
          organization_id: string
          remarks?: string | null
          section?: string | null
          student_id: string
          subject: string
          teacher_id: string
          updated_at?: string
        }
        Update: {
          academic_year?: string
          archived_at?: string | null
          archived_by?: string | null
          class_name?: string
          created_at?: string
          exam_type_id?: string
          id?: string
          is_absent?: boolean
          is_archived?: boolean | null
          marks_obtained?: number | null
          max_marks?: number
          organization_id?: string
          remarks?: string | null
          section?: string | null
          student_id?: string
          subject?: string
          teacher_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marks_entries_exam_type_id_fkey"
            columns: ["exam_type_id"]
            isOneToOne: false
            referencedRelation: "exam_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marks_entries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marks_entries_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students_or_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      marks_submissions: {
        Row: {
          academic_year: string
          class_name: string
          created_at: string
          exam_type_id: string
          id: string
          locked_at: string | null
          locked_by: string | null
          organization_id: string
          section: string | null
          status: string
          subject: string
          submitted_at: string | null
          submitted_by: string | null
          unlocked_at: string | null
          unlocked_by: string | null
          updated_at: string
        }
        Insert: {
          academic_year: string
          class_name: string
          created_at?: string
          exam_type_id: string
          id?: string
          locked_at?: string | null
          locked_by?: string | null
          organization_id: string
          section?: string | null
          status?: string
          subject: string
          submitted_at?: string | null
          submitted_by?: string | null
          unlocked_at?: string | null
          unlocked_by?: string | null
          updated_at?: string
        }
        Update: {
          academic_year?: string
          class_name?: string
          created_at?: string
          exam_type_id?: string
          id?: string
          locked_at?: string | null
          locked_by?: string | null
          organization_id?: string
          section?: string | null
          status?: string
          subject?: string
          submitted_at?: string | null
          submitted_by?: string | null
          unlocked_at?: string | null
          unlocked_by?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marks_submissions_exam_type_id_fkey"
            columns: ["exam_type_id"]
            isOneToOne: false
            referencedRelation: "exam_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marks_submissions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      master_modules: {
        Row: {
          category: string
          created_at: string
          depends_on: string[] | null
          display_order: number
          id: string
          is_active: boolean
          module_key: string
          module_name: string
        }
        Insert: {
          category: string
          created_at?: string
          depends_on?: string[] | null
          display_order?: number
          id?: string
          is_active?: boolean
          module_key: string
          module_name: string
        }
        Update: {
          category?: string
          created_at?: string
          depends_on?: string[] | null
          display_order?: number
          id?: string
          is_active?: boolean
          module_key?: string
          module_name?: string
        }
        Relationships: []
      }
      meetings: {
        Row: {
          archived_at: string | null
          archived_by: string | null
          created_at: string
          created_by: string
          description: string | null
          end_time: string
          id: string
          is_archived: boolean
          location: string | null
          meeting_date: string
          meeting_link: string | null
          meeting_type: string
          notes: string | null
          organization_id: string
          participants: Json | null
          reminder_minutes: number | null
          start_time: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          end_time: string
          id?: string
          is_archived?: boolean
          location?: string | null
          meeting_date: string
          meeting_link?: string | null
          meeting_type?: string
          notes?: string | null
          organization_id: string
          participants?: Json | null
          reminder_minutes?: number | null
          start_time: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          end_time?: string
          id?: string
          is_archived?: boolean
          location?: string | null
          meeting_date?: string
          meeting_link?: string | null
          meeting_type?: string
          notes?: string | null
          organization_id?: string
          participants?: Json | null
          reminder_minutes?: number | null
          start_time?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      message_attachments: {
        Row: {
          attachment_kind: string
          conversation_id: string
          created_at: string
          file_name: string
          file_size: number
          id: string
          message_id: string
          mime_type: string
          organization_id: string
          storage_path: string
          uploaded_by: string
        }
        Insert: {
          attachment_kind: string
          conversation_id: string
          created_at?: string
          file_name: string
          file_size: number
          id?: string
          message_id: string
          mime_type: string
          organization_id: string
          storage_path: string
          uploaded_by: string
        }
        Update: {
          attachment_kind?: string
          conversation_id?: string
          created_at?: string
          file_name?: string
          file_size?: number
          id?: string
          message_id?: string
          mime_type?: string
          organization_id?: string
          storage_path?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_attachments_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_attachments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachment_url: string | null
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean
          message: string
          message_tsv: unknown
          organization_id: string
          read_at: string | null
          receiver_id: string
          receiver_role: string
          sender_id: string
          sender_role: string
          status: string
          student_id: string | null
          updated_at: string
        }
        Insert: {
          attachment_url?: string | null
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          message_tsv?: unknown
          organization_id: string
          read_at?: string | null
          receiver_id: string
          receiver_role: string
          sender_id: string
          sender_role: string
          status?: string
          student_id?: string | null
          updated_at?: string
        }
        Update: {
          attachment_url?: string | null
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          message_tsv?: unknown
          organization_id?: string
          read_at?: string | null
          receiver_id?: string
          receiver_role?: string
          sender_id?: string
          sender_role?: string
          status?: string
          student_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students_or_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      messaging_read_audit: {
        Row: {
          admin_id: string
          conversation_id: string
          id: string
          opened_at: string
          organization_id: string
          parent_id: string | null
          student_id: string | null
          teacher_id: string | null
        }
        Insert: {
          admin_id: string
          conversation_id: string
          id?: string
          opened_at?: string
          organization_id: string
          parent_id?: string | null
          student_id?: string | null
          teacher_id?: string | null
        }
        Update: {
          admin_id?: string
          conversation_id?: string
          id?: string
          opened_at?: string
          organization_id?: string
          parent_id?: string | null
          student_id?: string | null
          teacher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messaging_read_audit_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messaging_read_audit_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      messaging_settings: {
        Row: {
          channel: string
          config: Json | null
          created_at: string | null
          default_sender: string | null
          id: string
          is_enabled: boolean | null
          organization_id: string
          updated_at: string | null
        }
        Insert: {
          channel: string
          config?: Json | null
          created_at?: string | null
          default_sender?: string | null
          id?: string
          is_enabled?: boolean | null
          organization_id: string
          updated_at?: string | null
        }
        Update: {
          channel?: string
          config?: Json | null
          created_at?: string | null
          default_sender?: string | null
          id?: string
          is_enabled?: boolean | null
          organization_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messaging_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_outbox: {
        Row: {
          attempts: number
          body: string
          created_at: string
          data: Json
          event_type: string
          id: string
          last_error: string | null
          organization_id: string
          recipient_user_id: string
          sent_at: string | null
          status: string
          title: string
        }
        Insert: {
          attempts?: number
          body: string
          created_at?: string
          data?: Json
          event_type: string
          id?: string
          last_error?: string | null
          organization_id: string
          recipient_user_id: string
          sent_at?: string | null
          status?: string
          title: string
        }
        Update: {
          attempts?: number
          body?: string
          created_at?: string
          data?: Json
          event_type?: string
          id?: string
          last_error?: string | null
          organization_id?: string
          recipient_user_id?: string
          sent_at?: string | null
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_outbox_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          id: string
          message: string
          metadata: Json | null
          organization_id: string
          read: boolean | null
          title: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          organization_id: string
          read?: boolean | null
          title: string
          type?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          organization_id?: string
          read?: boolean | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      number_sequences: {
        Row: {
          created_at: string
          current_value: number
          id: string
          organization_id: string
          sequence_type: string
          updated_at: string
          year: number
        }
        Insert: {
          created_at?: string
          current_value?: number
          id?: string
          organization_id: string
          sequence_type: string
          updated_at?: string
          year?: number
        }
        Update: {
          created_at?: string
          current_value?: number
          id?: string
          organization_id?: string
          sequence_type?: string
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "number_sequences_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_billing_config: {
        Row: {
          billing_cycle: string
          configured_at: string
          configured_by: string | null
          created_at: string
          custom_price: number
          id: string
          next_due_date: string | null
          notes: string | null
          organization_id: string
          plan_id: string | null
          plan_start_date: string | null
          plan_valid_till: string | null
          subscription_status: string
          total_installments: number
          updated_at: string
        }
        Insert: {
          billing_cycle?: string
          configured_at?: string
          configured_by?: string | null
          created_at?: string
          custom_price?: number
          id?: string
          next_due_date?: string | null
          notes?: string | null
          organization_id: string
          plan_id?: string | null
          plan_start_date?: string | null
          plan_valid_till?: string | null
          subscription_status?: string
          total_installments?: number
          updated_at?: string
        }
        Update: {
          billing_cycle?: string
          configured_at?: string
          configured_by?: string | null
          created_at?: string
          custom_price?: number
          id?: string
          next_due_date?: string | null
          notes?: string | null
          organization_id?: string
          plan_id?: string | null
          plan_start_date?: string | null
          plan_valid_till?: string | null
          subscription_status?: string
          total_installments?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_billing_config_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_billing_config_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_modules: {
        Row: {
          enabled: boolean
          id: string
          module_key: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          enabled?: boolean
          id?: string
          module_key: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          enabled?: boolean
          id?: string
          module_key?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_modules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_settings: {
        Row: {
          accountant_name: string | null
          accountant_signature_url: string | null
          address: string | null
          board_affiliation: string | null
          created_at: string
          email: string | null
          id: string
          logo_url: string | null
          organization_id: string
          phone: string | null
          place: string | null
          principal_name: string | null
          principal_signature_url: string | null
          school_name: string | null
          seal_url: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          accountant_name?: string | null
          accountant_signature_url?: string | null
          address?: string | null
          board_affiliation?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          organization_id: string
          phone?: string | null
          place?: string | null
          principal_name?: string | null
          principal_signature_url?: string | null
          school_name?: string | null
          seal_url?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          accountant_name?: string | null
          accountant_signature_url?: string | null
          address?: string | null
          board_affiliation?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          organization_id?: string
          phone?: string | null
          place?: string | null
          principal_name?: string | null
          principal_signature_url?: string | null
          school_name?: string | null
          seal_url?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_subscriptions: {
        Row: {
          billing_cycle: string
          created_at: string
          end_date: string
          id: string
          organization_id: string
          paid_amount: number
          paid_installments: number
          pending_amount: number
          plan_id: string | null
          razorpay_order_id: string | null
          start_date: string
          status: string
          total_amount: number
          total_installments: number
          updated_at: string
        }
        Insert: {
          billing_cycle?: string
          created_at?: string
          end_date: string
          id?: string
          organization_id: string
          paid_amount?: number
          paid_installments?: number
          pending_amount?: number
          plan_id?: string | null
          razorpay_order_id?: string | null
          start_date?: string
          status?: string
          total_amount?: number
          total_installments?: number
          updated_at?: string
        }
        Update: {
          billing_cycle?: string
          created_at?: string
          end_date?: string
          id?: string
          organization_id?: string
          paid_amount?: number
          paid_installments?: number
          pending_amount?: number
          plan_id?: string | null
          razorpay_order_id?: string | null
          start_date?: string
          status?: string
          total_amount?: number
          total_installments?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          domain: string | null
          id: string
          industry_type: Database["public"]["Enums"]["industry_type"] | null
          is_payment_enabled: boolean
          name: string
          plan_end_date: string | null
          plan_status: string
          plan_valid_till: string | null
          short_code: string
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          domain?: string | null
          id?: string
          industry_type?: Database["public"]["Enums"]["industry_type"] | null
          is_payment_enabled?: boolean
          name: string
          plan_end_date?: string | null
          plan_status?: string
          plan_valid_till?: string | null
          short_code: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          domain?: string | null
          id?: string
          industry_type?: Database["public"]["Enums"]["industry_type"] | null
          is_payment_enabled?: boolean
          name?: string
          plan_end_date?: string | null
          plan_status?: string
          plan_valid_till?: string | null
          short_code?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      parent_accounts: {
        Row: {
          admission_number: string
          created_at: string
          id: string
          last_login_at: string | null
          must_change_password: boolean
          organization_id: string
          recovery_email: string | null
          recovery_phone: string | null
          student_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admission_number: string
          created_at?: string
          id?: string
          last_login_at?: string | null
          must_change_password?: boolean
          organization_id: string
          recovery_email?: string | null
          recovery_phone?: string | null
          student_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admission_number?: string
          created_at?: string
          id?: string
          last_login_at?: string | null
          must_change_password?: boolean
          organization_id?: string
          recovery_email?: string | null
          recovery_phone?: string | null
          student_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "parent_accounts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_accounts_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "students_or_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      parent_password_resets: {
        Row: {
          attempts: number
          channel: string
          consumed_at: string | null
          created_at: string
          destination: string
          expires_at: string
          id: string
          ip_address: string | null
          otp_hash: string
          parent_account_id: string
        }
        Insert: {
          attempts?: number
          channel: string
          consumed_at?: string | null
          created_at?: string
          destination: string
          expires_at: string
          id?: string
          ip_address?: string | null
          otp_hash: string
          parent_account_id: string
        }
        Update: {
          attempts?: number
          channel?: string
          consumed_at?: string | null
          created_at?: string
          destination?: string
          expires_at?: string
          id?: string
          ip_address?: string | null
          otp_hash?: string
          parent_account_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "parent_password_resets_parent_account_id_fkey"
            columns: ["parent_account_id"]
            isOneToOne: false
            referencedRelation: "parent_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_allocations: {
        Row: {
          allocated_amount: number
          created_at: string
          fee_head_id: string
          id: string
          organization_id: string
          payment_id: string
          student_fee_term_item_id: string | null
          updated_at: string
        }
        Insert: {
          allocated_amount: number
          created_at?: string
          fee_head_id: string
          id?: string
          organization_id: string
          payment_id: string
          student_fee_term_item_id?: string | null
          updated_at?: string
        }
        Update: {
          allocated_amount?: number
          created_at?: string
          fee_head_id?: string
          id?: string
          organization_id?: string
          payment_id?: string
          student_fee_term_item_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_allocations_fee_head_id_fkey"
            columns: ["fee_head_id"]
            isOneToOne: false
            referencedRelation: "fee_heads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_allocations_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "fee_payment_receipt_view"
            referencedColumns: ["payment_id"]
          },
          {
            foreignKeyName: "payment_allocations_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "fee_payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_allocations_student_fee_term_item_id_fkey"
            columns: ["student_fee_term_item_id"]
            isOneToOne: false
            referencedRelation: "fee_payment_receipt_view"
            referencedColumns: ["term_item_id"]
          },
          {
            foreignKeyName: "payment_allocations_student_fee_term_item_id_fkey"
            columns: ["student_fee_term_item_id"]
            isOneToOne: false
            referencedRelation: "student_fee_term_items"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_links: {
        Row: {
          academic_year: string
          amount: number
          created_at: string
          created_by: string | null
          currency: string
          failure_reason: string | null
          id: string
          installment_id: string | null
          notes: Json
          organization_id: string
          paid_at: string | null
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_payment_link_id: string | null
          razorpay_short_url: string | null
          status: string
          student_id: string
          term_number: number | null
          updated_at: string
          whatsapp_sent_at: string | null
        }
        Insert: {
          academic_year: string
          amount: number
          created_at?: string
          created_by?: string | null
          currency?: string
          failure_reason?: string | null
          id?: string
          installment_id?: string | null
          notes?: Json
          organization_id: string
          paid_at?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_payment_link_id?: string | null
          razorpay_short_url?: string | null
          status?: string
          student_id: string
          term_number?: number | null
          updated_at?: string
          whatsapp_sent_at?: string | null
        }
        Update: {
          academic_year?: string
          amount?: number
          created_at?: string
          created_by?: string | null
          currency?: string
          failure_reason?: string | null
          id?: string
          installment_id?: string | null
          notes?: Json
          organization_id?: string
          paid_at?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_payment_link_id?: string | null
          razorpay_short_url?: string | null
          status?: string
          student_id?: string
          term_number?: number | null
          updated_at?: string
          whatsapp_sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_links_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          created_at: string
          features: Json | null
          id: string
          is_active: boolean
          name: string
          price_monthly: number
          price_yearly: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          features?: Json | null
          id?: string
          is_active?: boolean
          name: string
          price_monthly?: number
          price_yearly?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          features?: Json | null
          id?: string
          is_active?: boolean
          name?: string
          price_monthly?: number
          price_yearly?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          blood_group: string | null
          city: string | null
          country: string | null
          created_at: string
          date_of_birth: string | null
          department: string | null
          designation: string | null
          email: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          employee_id: string | null
          experience_years: number | null
          gender: string | null
          id: string
          joining_date: string | null
          must_change_password: boolean
          name: string
          organization_id: string | null
          phone: string | null
          pincode: string | null
          qualification: string | null
          state: string | null
          status: string | null
          subject: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          blood_group?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          department?: string | null
          designation?: string | null
          email: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          employee_id?: string | null
          experience_years?: number | null
          gender?: string | null
          id: string
          joining_date?: string | null
          must_change_password?: boolean
          name: string
          organization_id?: string | null
          phone?: string | null
          pincode?: string | null
          qualification?: string | null
          state?: string | null
          status?: string | null
          subject?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          blood_group?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          department?: string | null
          designation?: string | null
          email?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          employee_id?: string | null
          experience_years?: number | null
          gender?: string | null
          id?: string
          joining_date?: string | null
          must_change_password?: boolean
          name?: string
          organization_id?: string | null
          phone?: string | null
          pincode?: string | null
          qualification?: string | null
          state?: string | null
          status?: string | null
          subject?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      promotion_logs: {
        Row: {
          academic_year: string
          created_at: string
          from_academic_year: string
          from_class: string
          id: string
          is_reversed: boolean
          organization_id: string
          promoted_by: string | null
          promotion_data: Json | null
          reversed_at: string | null
          reversed_by: string | null
          to_academic_year: string
          to_class: string
          total_detained: number
          total_graduated: number
          total_promoted: number
        }
        Insert: {
          academic_year: string
          created_at?: string
          from_academic_year: string
          from_class: string
          id?: string
          is_reversed?: boolean
          organization_id: string
          promoted_by?: string | null
          promotion_data?: Json | null
          reversed_at?: string | null
          reversed_by?: string | null
          to_academic_year: string
          to_class: string
          total_detained?: number
          total_graduated?: number
          total_promoted?: number
        }
        Update: {
          academic_year?: string
          created_at?: string
          from_academic_year?: string
          from_class?: string
          id?: string
          is_reversed?: boolean
          organization_id?: string
          promoted_by?: string | null
          promotion_data?: Json | null
          reversed_at?: string | null
          reversed_by?: string | null
          to_academic_year?: string
          to_class?: string
          total_detained?: number
          total_graduated?: number
          total_promoted?: number
        }
        Relationships: [
          {
            foreignKeyName: "promotion_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      push_tokens: {
        Row: {
          created_at: string
          device_id: string
          id: string
          last_seen_at: string
          organization_id: string
          platform: string
          push_token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_id: string
          id?: string
          last_seen_at?: string
          organization_id: string
          platform: string
          push_token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_id?: string
          id?: string
          last_seen_at?: string
          organization_id?: string
          platform?: string
          push_token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_tokens_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          industry_type: Database["public"]["Enums"]["industry_type"]
          is_default: boolean | null
          name: string
          organization_id: string
          permissions: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          industry_type?: Database["public"]["Enums"]["industry_type"]
          is_default?: boolean | null
          name: string
          organization_id: string
          permissions?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          industry_type?: Database["public"]["Enums"]["industry_type"]
          is_default?: boolean | null
          name?: string
          organization_id?: string
          permissions?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      salary_adjustments: {
        Row: {
          added_by: string
          added_by_name: string | null
          adjustment_type: string
          amount: number
          created_at: string
          description: string
          id: string
          organization_id: string
          salary_month: number
          salary_payment_id: string | null
          salary_year: number
          source: string
          staff_id: string
          updated_at: string
        }
        Insert: {
          added_by: string
          added_by_name?: string | null
          adjustment_type: string
          amount: number
          created_at?: string
          description: string
          id?: string
          organization_id: string
          salary_month: number
          salary_payment_id?: string | null
          salary_year: number
          source: string
          staff_id: string
          updated_at?: string
        }
        Update: {
          added_by?: string
          added_by_name?: string | null
          adjustment_type?: string
          amount?: number
          created_at?: string
          description?: string
          id?: string
          organization_id?: string
          salary_month?: number
          salary_payment_id?: string | null
          salary_year?: number
          source?: string
          staff_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "salary_adjustments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salary_adjustments_salary_payment_id_fkey"
            columns: ["salary_payment_id"]
            isOneToOne: false
            referencedRelation: "salary_payments"
            referencedColumns: ["id"]
          },
        ]
      }
      salary_delete_requests: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          reason: string
          requested_by: string
          requester_name: string | null
          requester_role: string | null
          review_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_name: string | null
          salary_id: string
          staff_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          reason: string
          requested_by: string
          requester_name?: string | null
          requester_role?: string | null
          review_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_name?: string | null
          salary_id: string
          staff_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          reason?: string
          requested_by?: string
          requester_name?: string | null
          requester_role?: string | null
          review_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_name?: string | null
          salary_id?: string
          staff_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "salary_delete_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salary_delete_requests_salary_id_fkey"
            columns: ["salary_id"]
            isOneToOne: false
            referencedRelation: "staff_salaries"
            referencedColumns: ["id"]
          },
        ]
      }
      salary_payments: {
        Row: {
          attendance_bonus: number
          base_salary: number
          bonus_eligible: boolean
          created_at: string
          created_by: string | null
          id: string
          leave_deduction: number | null
          manager_allowances: number | null
          manager_base_salary: number | null
          manager_deductions: number | null
          manager_id: string | null
          manager_name: string | null
          manager_net_salary: number | null
          manager_set_at: string | null
          month: number
          net_salary: number
          organization_id: string
          paid_leave_days: number | null
          payment_date: string
          payment_mode: string
          per_day_salary: number | null
          period_allowances: number | null
          period_deductions: number | null
          salary_config_id: string | null
          staff_id: string
          status: string
          tally_last_synced_at: string | null
          tally_reference_id: string | null
          tally_sync_error: string | null
          tally_sync_status: string | null
          tally_voucher_number: string | null
          total_allowances: number | null
          total_deductions: number | null
          total_leave_days: number | null
          transaction_id: string | null
          unpaid_leave_days: number | null
          updated_at: string
          worked_days: number | null
          working_days_in_month: number | null
          year: number
        }
        Insert: {
          attendance_bonus?: number
          base_salary: number
          bonus_eligible?: boolean
          created_at?: string
          created_by?: string | null
          id?: string
          leave_deduction?: number | null
          manager_allowances?: number | null
          manager_base_salary?: number | null
          manager_deductions?: number | null
          manager_id?: string | null
          manager_name?: string | null
          manager_net_salary?: number | null
          manager_set_at?: string | null
          month: number
          net_salary: number
          organization_id: string
          paid_leave_days?: number | null
          payment_date: string
          payment_mode?: string
          per_day_salary?: number | null
          period_allowances?: number | null
          period_deductions?: number | null
          salary_config_id?: string | null
          staff_id: string
          status?: string
          tally_last_synced_at?: string | null
          tally_reference_id?: string | null
          tally_sync_error?: string | null
          tally_sync_status?: string | null
          tally_voucher_number?: string | null
          total_allowances?: number | null
          total_deductions?: number | null
          total_leave_days?: number | null
          transaction_id?: string | null
          unpaid_leave_days?: number | null
          updated_at?: string
          worked_days?: number | null
          working_days_in_month?: number | null
          year: number
        }
        Update: {
          attendance_bonus?: number
          base_salary?: number
          bonus_eligible?: boolean
          created_at?: string
          created_by?: string | null
          id?: string
          leave_deduction?: number | null
          manager_allowances?: number | null
          manager_base_salary?: number | null
          manager_deductions?: number | null
          manager_id?: string | null
          manager_name?: string | null
          manager_net_salary?: number | null
          manager_set_at?: string | null
          month?: number
          net_salary?: number
          organization_id?: string
          paid_leave_days?: number | null
          payment_date?: string
          payment_mode?: string
          per_day_salary?: number | null
          period_allowances?: number | null
          period_deductions?: number | null
          salary_config_id?: string | null
          staff_id?: string
          status?: string
          tally_last_synced_at?: string | null
          tally_reference_id?: string | null
          tally_sync_error?: string | null
          tally_sync_status?: string | null
          tally_voucher_number?: string | null
          total_allowances?: number | null
          total_deductions?: number | null
          total_leave_days?: number | null
          transaction_id?: string | null
          unpaid_leave_days?: number | null
          updated_at?: string
          worked_days?: number | null
          working_days_in_month?: number | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "salary_payments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salary_payments_salary_config_id_fkey"
            columns: ["salary_config_id"]
            isOneToOne: false
            referencedRelation: "staff_salaries"
            referencedColumns: ["id"]
          },
        ]
      }
      sandwich_leave_policies: {
        Row: {
          apply_to_festival_holidays: boolean
          apply_to_public_holidays: boolean
          apply_to_school_holidays: boolean
          apply_to_unpaid: boolean
          apply_to_vacation_days: boolean
          apply_to_weekends: boolean
          created_at: string
          enabled: boolean
          leave_type_codes: string[]
          organization_id: string
          updated_at: string
        }
        Insert: {
          apply_to_festival_holidays?: boolean
          apply_to_public_holidays?: boolean
          apply_to_school_holidays?: boolean
          apply_to_unpaid?: boolean
          apply_to_vacation_days?: boolean
          apply_to_weekends?: boolean
          created_at?: string
          enabled?: boolean
          leave_type_codes?: string[]
          organization_id: string
          updated_at?: string
        }
        Update: {
          apply_to_festival_holidays?: boolean
          apply_to_public_holidays?: boolean
          apply_to_school_holidays?: boolean
          apply_to_unpaid?: boolean
          apply_to_vacation_days?: boolean
          apply_to_weekends?: boolean
          created_at?: string
          enabled?: boolean
          leave_type_codes?: string[]
          organization_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      sections: {
        Row: {
          class_name: string
          created_at: string
          id: string
          organization_id: string
          section_name: string
          updated_at: string
        }
        Insert: {
          class_name: string
          created_at?: string
          id?: string
          organization_id: string
          section_name: string
          updated_at?: string
        }
        Update: {
          class_name?: string
          created_at?: string
          id?: string
          organization_id?: string
          section_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sections_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      sports_or_activities: {
        Row: {
          archived_at: string | null
          archived_by: string | null
          created_at: string
          id: string
          is_archived: boolean | null
          organization_id: string
          performance_json: Json | null
          recorded_at: string
          student_id: string | null
          type: string
        }
        Insert: {
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          id?: string
          is_archived?: boolean | null
          organization_id: string
          performance_json?: Json | null
          recorded_at?: string
          student_id?: string | null
          type: string
        }
        Update: {
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          id?: string
          is_archived?: boolean | null
          organization_id?: string
          performance_json?: Json | null
          recorded_at?: string
          student_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "sports_or_activities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sports_or_activities_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students_or_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_permissions: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          document_url: string | null
          duration_minutes: number
          emergency_contact: string | null
          from_time: string
          id: string
          organization_id: string
          permission_date: string
          reason: string
          rejection_reason: string | null
          role: string | null
          staff_id: string
          staff_name: string | null
          status: string
          to_time: string
          updated_at: string
          withdrawn_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          document_url?: string | null
          duration_minutes: number
          emergency_contact?: string | null
          from_time: string
          id?: string
          organization_id: string
          permission_date: string
          reason: string
          rejection_reason?: string | null
          role?: string | null
          staff_id: string
          staff_name?: string | null
          status?: string
          to_time: string
          updated_at?: string
          withdrawn_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          document_url?: string | null
          duration_minutes?: number
          emergency_contact?: string | null
          from_time?: string
          id?: string
          organization_id?: string
          permission_date?: string
          reason?: string
          rejection_reason?: string | null
          role?: string | null
          staff_id?: string
          staff_name?: string | null
          status?: string
          to_time?: string
          updated_at?: string
          withdrawn_at?: string | null
        }
        Relationships: []
      }
      staff_salaries: {
        Row: {
          allowances: Json | null
          approval_status: string | null
          approved_by: string | null
          base_salary: number
          created_at: string
          deductions: Json | null
          effective_from: string
          effective_month: string | null
          id: string
          is_current: boolean
          is_deleted: boolean
          last_salary_changed_at: string | null
          manager_id: string | null
          manager_set_at: string | null
          net_salary: number | null
          organization_id: string
          staff_id: string
          total_allowances: number | null
          total_deductions: number | null
          updated_at: string
          version: number
        }
        Insert: {
          allowances?: Json | null
          approval_status?: string | null
          approved_by?: string | null
          base_salary: number
          created_at?: string
          deductions?: Json | null
          effective_from?: string
          effective_month?: string | null
          id?: string
          is_current?: boolean
          is_deleted?: boolean
          last_salary_changed_at?: string | null
          manager_id?: string | null
          manager_set_at?: string | null
          net_salary?: number | null
          organization_id: string
          staff_id: string
          total_allowances?: number | null
          total_deductions?: number | null
          updated_at?: string
          version?: number
        }
        Update: {
          allowances?: Json | null
          approval_status?: string | null
          approved_by?: string | null
          base_salary?: number
          created_at?: string
          deductions?: Json | null
          effective_from?: string
          effective_month?: string | null
          id?: string
          is_current?: boolean
          is_deleted?: boolean
          last_salary_changed_at?: string | null
          manager_id?: string | null
          manager_set_at?: string | null
          net_salary?: number | null
          organization_id?: string
          staff_id?: string
          total_allowances?: number | null
          total_deductions?: number | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "staff_salaries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      state_master: {
        Row: {
          board_name: string | null
          code: string
          created_at: string
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          board_name?: string | null
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          board_name?: string | null
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      student_absence_alert_history: {
        Row: {
          actor_id: string | null
          alert_id: string | null
          consecutive_days: number | null
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          note: string | null
          organization_id: string
          student_id: string
        }
        Insert: {
          actor_id?: string | null
          alert_id?: string | null
          consecutive_days?: number | null
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          note?: string | null
          organization_id: string
          student_id: string
        }
        Update: {
          actor_id?: string | null
          alert_id?: string | null
          consecutive_days?: number | null
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          note?: string | null
          organization_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_absence_alert_history_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "student_absence_alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_absence_alert_history_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      student_absence_alerts: {
        Row: {
          class_name: string | null
          consecutive_absent_days: number
          created_at: string
          first_absent_date: string | null
          id: string
          last_absent_date: string | null
          last_follow_up_at: string | null
          last_follow_up_note: string | null
          last_whatsapp_sent_at: string | null
          last_whatsapp_threshold: number | null
          organization_id: string
          resolved_at: string | null
          resolved_by: string | null
          section_name: string | null
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          class_name?: string | null
          consecutive_absent_days?: number
          created_at?: string
          first_absent_date?: string | null
          id?: string
          last_absent_date?: string | null
          last_follow_up_at?: string | null
          last_follow_up_note?: string | null
          last_whatsapp_sent_at?: string | null
          last_whatsapp_threshold?: number | null
          organization_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          section_name?: string | null
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          class_name?: string | null
          consecutive_absent_days?: number
          created_at?: string
          first_absent_date?: string | null
          id?: string
          last_absent_date?: string | null
          last_follow_up_at?: string | null
          last_follow_up_note?: string | null
          last_whatsapp_sent_at?: string | null
          last_whatsapp_threshold?: number | null
          organization_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          section_name?: string | null
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_absence_alerts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_absence_alerts_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students_or_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      student_academic_history: {
        Row: {
          academic_year: string
          class_name: string
          created_at: string
          created_by: string | null
          id: string
          organization_id: string
          promoted_from_class: string | null
          promoted_from_section: string | null
          promoted_from_year: string | null
          promotion_status: string
          roll_number: string | null
          section_name: string | null
          stream: string | null
          student_id: string
        }
        Insert: {
          academic_year: string
          class_name: string
          created_at?: string
          created_by?: string | null
          id?: string
          organization_id: string
          promoted_from_class?: string | null
          promoted_from_section?: string | null
          promoted_from_year?: string | null
          promotion_status?: string
          roll_number?: string | null
          section_name?: string | null
          stream?: string | null
          student_id: string
        }
        Update: {
          academic_year?: string
          class_name?: string
          created_at?: string
          created_by?: string | null
          id?: string
          organization_id?: string
          promoted_from_class?: string | null
          promoted_from_section?: string | null
          promoted_from_year?: string | null
          promotion_status?: string
          roll_number?: string | null
          section_name?: string | null
          stream?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_academic_history_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_academic_history_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students_or_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      student_documents: {
        Row: {
          approval_status: string | null
          approved_by: string | null
          created_at: string
          document_type: string
          file_url: string | null
          generated_or_uploaded: string
          id: string
          issue_date: string | null
          notes: string | null
          organization_id: string
          student_id: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          approval_status?: string | null
          approved_by?: string | null
          created_at?: string
          document_type: string
          file_url?: string | null
          generated_or_uploaded?: string
          id?: string
          issue_date?: string | null
          notes?: string | null
          organization_id: string
          student_id: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          approval_status?: string | null
          approved_by?: string | null
          created_at?: string
          document_type?: string
          file_url?: string | null
          generated_or_uploaded?: string
          id?: string
          issue_date?: string | null
          notes?: string | null
          organization_id?: string
          student_id?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_documents_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students_or_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      student_fee_overrides: {
        Row: {
          academic_year: string
          annual_payment_discount_enabled: boolean | null
          annual_payment_discount_percent: number | null
          archived_at: string | null
          base_annual_fee: number | null
          billing_type: string
          class_name: string
          concession_amount: number | null
          created_at: string
          created_by: string
          custom_total_fee: number | null
          discount_type: string
          discount_value: number | null
          fee_head_discounts: Json | null
          final_payable_amount: number
          id: string
          manually_edited: boolean
          notes: string | null
          organization_id: string
          original_fee: number
          payment_mode: string
          section_name: string | null
          slip_cancelled_at: string | null
          slip_cancelled_by: string | null
          slip_issued_at: string | null
          slip_number: string | null
          status: string
          student_id: string
          superseded_by: string | null
          term1_percent: number | null
          term2_percent: number | null
          term3_percent: number | null
          updated_at: string
          usage_billing_config: Json | null
          version: number
          working_days: number | null
        }
        Insert: {
          academic_year: string
          annual_payment_discount_enabled?: boolean | null
          annual_payment_discount_percent?: number | null
          archived_at?: string | null
          base_annual_fee?: number | null
          billing_type?: string
          class_name: string
          concession_amount?: number | null
          created_at?: string
          created_by: string
          custom_total_fee?: number | null
          discount_type?: string
          discount_value?: number | null
          fee_head_discounts?: Json | null
          final_payable_amount: number
          id?: string
          manually_edited?: boolean
          notes?: string | null
          organization_id: string
          original_fee: number
          payment_mode?: string
          section_name?: string | null
          slip_cancelled_at?: string | null
          slip_cancelled_by?: string | null
          slip_issued_at?: string | null
          slip_number?: string | null
          status?: string
          student_id: string
          superseded_by?: string | null
          term1_percent?: number | null
          term2_percent?: number | null
          term3_percent?: number | null
          updated_at?: string
          usage_billing_config?: Json | null
          version?: number
          working_days?: number | null
        }
        Update: {
          academic_year?: string
          annual_payment_discount_enabled?: boolean | null
          annual_payment_discount_percent?: number | null
          archived_at?: string | null
          base_annual_fee?: number | null
          billing_type?: string
          class_name?: string
          concession_amount?: number | null
          created_at?: string
          created_by?: string
          custom_total_fee?: number | null
          discount_type?: string
          discount_value?: number | null
          fee_head_discounts?: Json | null
          final_payable_amount?: number
          id?: string
          manually_edited?: boolean
          notes?: string | null
          organization_id?: string
          original_fee?: number
          payment_mode?: string
          section_name?: string | null
          slip_cancelled_at?: string | null
          slip_cancelled_by?: string | null
          slip_issued_at?: string | null
          slip_number?: string | null
          status?: string
          student_id?: string
          superseded_by?: string | null
          term1_percent?: number | null
          term2_percent?: number | null
          term3_percent?: number | null
          updated_at?: string
          usage_billing_config?: Json | null
          version?: number
          working_days?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "student_fee_overrides_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_fee_overrides_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students_or_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_fee_overrides_superseded_by_fkey"
            columns: ["superseded_by"]
            isOneToOne: false
            referencedRelation: "student_fee_overrides"
            referencedColumns: ["id"]
          },
        ]
      }
      student_fee_overrides_history: {
        Row: {
          academic_year: string
          archived_at: string
          archived_by: string | null
          id: string
          organization_id: string
          override_id: string
          reason: string | null
          snapshot: Json
          student_id: string
          version: number
        }
        Insert: {
          academic_year: string
          archived_at?: string
          archived_by?: string | null
          id?: string
          organization_id: string
          override_id: string
          reason?: string | null
          snapshot: Json
          student_id: string
          version: number
        }
        Update: {
          academic_year?: string
          archived_at?: string
          archived_by?: string | null
          id?: string
          organization_id?: string
          override_id?: string
          reason?: string | null
          snapshot?: Json
          student_id?: string
          version?: number
        }
        Relationships: []
      }
      student_fee_term_items: {
        Row: {
          billing_type: string
          created_at: string
          discount_amount: number
          fee_head_id: string | null
          fee_head_name: string | null
          final_amount: number
          id: string
          is_recurring: boolean
          organization_id: string
          original_amount: number
          paid_amount: number
          student_fee_override_id: string
          student_fee_term_id: string
          student_id: string
          synthetic_fee_key: string | null
          updated_at: string
        }
        Insert: {
          billing_type: string
          created_at?: string
          discount_amount?: number
          fee_head_id?: string | null
          fee_head_name?: string | null
          final_amount?: number
          id?: string
          is_recurring?: boolean
          organization_id: string
          original_amount?: number
          paid_amount?: number
          student_fee_override_id: string
          student_fee_term_id: string
          student_id: string
          synthetic_fee_key?: string | null
          updated_at?: string
        }
        Update: {
          billing_type?: string
          created_at?: string
          discount_amount?: number
          fee_head_id?: string | null
          fee_head_name?: string | null
          final_amount?: number
          id?: string
          is_recurring?: boolean
          organization_id?: string
          original_amount?: number
          paid_amount?: number
          student_fee_override_id?: string
          student_fee_term_id?: string
          student_id?: string
          synthetic_fee_key?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_fee_term_items_fee_head_id_fkey"
            columns: ["fee_head_id"]
            isOneToOne: false
            referencedRelation: "fee_heads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_fee_term_items_student_fee_override_id_fkey"
            columns: ["student_fee_override_id"]
            isOneToOne: false
            referencedRelation: "student_fee_overrides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_fee_term_items_student_fee_term_id_fkey"
            columns: ["student_fee_term_id"]
            isOneToOne: false
            referencedRelation: "student_fee_terms"
            referencedColumns: ["id"]
          },
        ]
      }
      student_fee_terms: {
        Row: {
          academic_year: string
          balance_amount: number | null
          created_at: string
          due_amount: number | null
          due_date: string | null
          grace_days: number | null
          id: string
          installment_name: string | null
          installment_order: number | null
          last_reminder_at: string | null
          late_fee_paid: number
          late_fee_type: string | null
          late_fee_value: number | null
          organization_id: string
          paid_amount: number
          status: string
          student_fee_override_id: string
          student_id: string
          term_amount: number
          term_number: number
          updated_at: string
        }
        Insert: {
          academic_year?: string
          balance_amount?: number | null
          created_at?: string
          due_amount?: number | null
          due_date?: string | null
          grace_days?: number | null
          id?: string
          installment_name?: string | null
          installment_order?: number | null
          last_reminder_at?: string | null
          late_fee_paid?: number
          late_fee_type?: string | null
          late_fee_value?: number | null
          organization_id: string
          paid_amount?: number
          status?: string
          student_fee_override_id: string
          student_id: string
          term_amount?: number
          term_number: number
          updated_at?: string
        }
        Update: {
          academic_year?: string
          balance_amount?: number | null
          created_at?: string
          due_amount?: number | null
          due_date?: string | null
          grace_days?: number | null
          id?: string
          installment_name?: string | null
          installment_order?: number | null
          last_reminder_at?: string | null
          late_fee_paid?: number
          late_fee_type?: string | null
          late_fee_value?: number | null
          organization_id?: string
          paid_amount?: number
          status?: string
          student_fee_override_id?: string
          student_id?: string
          term_amount?: number
          term_number?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_fee_terms_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_fee_terms_student_fee_override_id_fkey"
            columns: ["student_fee_override_id"]
            isOneToOne: false
            referencedRelation: "student_fee_overrides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_fee_terms_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students_or_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      students_or_clients: {
        Row: {
          aadhaar_encrypted: string | null
          aadhaar_last_four: string | null
          academic_year: string | null
          address: string | null
          admission_number: string | null
          admission_status: string | null
          admitted_at: string | null
          admitted_by: string | null
          application_id: string | null
          archived_at: string | null
          archived_by: string | null
          blood_group: string | null
          caste: string | null
          class: string | null
          created_at: string
          created_by: string | null
          date_of_birth: string | null
          deleted_at: string | null
          deleted_by: string | null
          details_json: Json | null
          discount_percentage: number | null
          document_verified: boolean | null
          email: string | null
          father_email: string | null
          father_name: string | null
          father_occupation: string | null
          father_phone: string | null
          fee_paid: boolean | null
          gender: string | null
          guardian_email: string | null
          guardian_name: string | null
          guardian_phone: string | null
          guardian_relation: string | null
          id: string
          is_archived: boolean
          medical_record: Json | null
          medical_report_url: string | null
          mother_email: string | null
          mother_name: string | null
          mother_occupation: string | null
          mother_phone: string | null
          name: string
          noc_document_url: string | null
          old_admission_number: string | null
          organization_id: string
          parent_declaration: Json | null
          pen_number: string | null
          pen_verified: boolean
          phone: string | null
          photo_url: string | null
          rejected_at: string | null
          rejected_by: string | null
          roll_number: string | null
          section: string | null
          status: string | null
          tc_issued: boolean
          tc_issued_by: string | null
          tc_issued_date: string | null
          tc_reason: string | null
          term_payment_plan: string | null
          transport_opted: boolean
          transport_route: string | null
          transport_stop: string | null
          updated_at: string
          upper_id: string | null
          upper_verified: boolean
        }
        Insert: {
          aadhaar_encrypted?: string | null
          aadhaar_last_four?: string | null
          academic_year?: string | null
          address?: string | null
          admission_number?: string | null
          admission_status?: string | null
          admitted_at?: string | null
          admitted_by?: string | null
          application_id?: string | null
          archived_at?: string | null
          archived_by?: string | null
          blood_group?: string | null
          caste?: string | null
          class?: string | null
          created_at?: string
          created_by?: string | null
          date_of_birth?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          details_json?: Json | null
          discount_percentage?: number | null
          document_verified?: boolean | null
          email?: string | null
          father_email?: string | null
          father_name?: string | null
          father_occupation?: string | null
          father_phone?: string | null
          fee_paid?: boolean | null
          gender?: string | null
          guardian_email?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          guardian_relation?: string | null
          id?: string
          is_archived?: boolean
          medical_record?: Json | null
          medical_report_url?: string | null
          mother_email?: string | null
          mother_name?: string | null
          mother_occupation?: string | null
          mother_phone?: string | null
          name: string
          noc_document_url?: string | null
          old_admission_number?: string | null
          organization_id: string
          parent_declaration?: Json | null
          pen_number?: string | null
          pen_verified?: boolean
          phone?: string | null
          photo_url?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          roll_number?: string | null
          section?: string | null
          status?: string | null
          tc_issued?: boolean
          tc_issued_by?: string | null
          tc_issued_date?: string | null
          tc_reason?: string | null
          term_payment_plan?: string | null
          transport_opted?: boolean
          transport_route?: string | null
          transport_stop?: string | null
          updated_at?: string
          upper_id?: string | null
          upper_verified?: boolean
        }
        Update: {
          aadhaar_encrypted?: string | null
          aadhaar_last_four?: string | null
          academic_year?: string | null
          address?: string | null
          admission_number?: string | null
          admission_status?: string | null
          admitted_at?: string | null
          admitted_by?: string | null
          application_id?: string | null
          archived_at?: string | null
          archived_by?: string | null
          blood_group?: string | null
          caste?: string | null
          class?: string | null
          created_at?: string
          created_by?: string | null
          date_of_birth?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          details_json?: Json | null
          discount_percentage?: number | null
          document_verified?: boolean | null
          email?: string | null
          father_email?: string | null
          father_name?: string | null
          father_occupation?: string | null
          father_phone?: string | null
          fee_paid?: boolean | null
          gender?: string | null
          guardian_email?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          guardian_relation?: string | null
          id?: string
          is_archived?: boolean
          medical_record?: Json | null
          medical_report_url?: string | null
          mother_email?: string | null
          mother_name?: string | null
          mother_occupation?: string | null
          mother_phone?: string | null
          name?: string
          noc_document_url?: string | null
          old_admission_number?: string | null
          organization_id?: string
          parent_declaration?: Json | null
          pen_number?: string | null
          pen_verified?: boolean
          phone?: string | null
          photo_url?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          roll_number?: string | null
          section?: string | null
          status?: string | null
          tc_issued?: boolean
          tc_issued_by?: string | null
          tc_issued_date?: string | null
          tc_reason?: string | null
          term_payment_plan?: string | null
          transport_opted?: boolean
          transport_route?: string | null
          transport_stop?: string | null
          updated_at?: string
          upper_id?: string | null
          upper_verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "students_or_clients_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_or_clients_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          category: string
          code: string | null
          created_at: string
          id: string
          is_system_generated: boolean
          name: string
          organization_id: string
          status: string
          updated_at: string
        }
        Insert: {
          category?: string
          code?: string | null
          created_at?: string
          id?: string
          is_system_generated?: boolean
          name: string
          organization_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          category?: string
          code?: string | null
          created_at?: string
          id?: string
          is_system_generated?: boolean
          name?: string
          organization_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subjects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      substitutions: {
        Row: {
          assigned_by: string | null
          class_name: string
          created_at: string
          daily_timetable_id: string | null
          date: string
          end_time: string
          id: string
          notes: string | null
          organization_id: string
          original_teacher_id: string
          period_label: string
          reason: string
          section_name: string | null
          start_time: string
          status: string
          substitute_teacher_id: string | null
          updated_at: string
        }
        Insert: {
          assigned_by?: string | null
          class_name: string
          created_at?: string
          daily_timetable_id?: string | null
          date: string
          end_time: string
          id?: string
          notes?: string | null
          organization_id: string
          original_teacher_id: string
          period_label: string
          reason?: string
          section_name?: string | null
          start_time: string
          status?: string
          substitute_teacher_id?: string | null
          updated_at?: string
        }
        Update: {
          assigned_by?: string | null
          class_name?: string
          created_at?: string
          daily_timetable_id?: string | null
          date?: string
          end_time?: string
          id?: string
          notes?: string | null
          organization_id?: string
          original_teacher_id?: string
          period_label?: string
          reason?: string
          section_name?: string | null
          start_time?: string
          status?: string
          substitute_teacher_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "substitutions_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "substitutions_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "substitutions_daily_timetable_id_fkey"
            columns: ["daily_timetable_id"]
            isOneToOne: false
            referencedRelation: "daily_timetable"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "substitutions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "substitutions_original_teacher_id_fkey"
            columns: ["original_teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "substitutions_original_teacher_id_fkey"
            columns: ["original_teacher_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "substitutions_substitute_teacher_id_fkey"
            columns: ["substitute_teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "substitutions_substitute_teacher_id_fkey"
            columns: ["substitute_teacher_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tally_imported_ledgers: {
        Row: {
          closing_balance: number | null
          created_at: string | null
          id: string
          ledger_name: string
          ledger_type: string | null
          opening_balance: number | null
          organization_id: string
          parent_group: string | null
          raw_payload: Json | null
          updated_at: string | null
        }
        Insert: {
          closing_balance?: number | null
          created_at?: string | null
          id?: string
          ledger_name: string
          ledger_type?: string | null
          opening_balance?: number | null
          organization_id: string
          parent_group?: string | null
          raw_payload?: Json | null
          updated_at?: string | null
        }
        Update: {
          closing_balance?: number | null
          created_at?: string | null
          id?: string
          ledger_name?: string
          ledger_type?: string | null
          opening_balance?: number | null
          organization_id?: string
          parent_group?: string | null
          raw_payload?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tally_imported_ledgers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      tally_imported_vouchers: {
        Row: {
          amount: number | null
          created_at: string | null
          crm_record_id: string | null
          crm_record_type: string | null
          id: string
          ledger_name: string | null
          match_status: string | null
          narration: string | null
          organization_id: string
          party_name: string | null
          raw_payload: Json | null
          updated_at: string | null
          voucher_date: string | null
          voucher_number: string
          voucher_type: string
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          crm_record_id?: string | null
          crm_record_type?: string | null
          id?: string
          ledger_name?: string | null
          match_status?: string | null
          narration?: string | null
          organization_id: string
          party_name?: string | null
          raw_payload?: Json | null
          updated_at?: string | null
          voucher_date?: string | null
          voucher_number: string
          voucher_type: string
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          crm_record_id?: string | null
          crm_record_type?: string | null
          id?: string
          ledger_name?: string | null
          match_status?: string | null
          narration?: string | null
          organization_id?: string
          party_name?: string | null
          raw_payload?: Json | null
          updated_at?: string | null
          voucher_date?: string | null
          voucher_number?: string
          voucher_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "tally_imported_vouchers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      tally_ledger_mappings: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          ledger_group: string | null
          ledger_type: string
          organization_id: string
          source_type: string
          source_value: string
          tally_ledger_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          ledger_group?: string | null
          ledger_type?: string
          organization_id: string
          source_type: string
          source_value: string
          tally_ledger_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          ledger_group?: string | null
          ledger_type?: string
          organization_id?: string
          source_type?: string
          source_value?: string
          tally_ledger_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tally_ledger_mappings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      tally_sync_logs: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          organization_id: string
          record_id: string
          record_type: string
          request_payload: string | null
          response_payload: string | null
          status: string | null
          sync_direction: string
          synced_at: string | null
          synced_by: string | null
          tally_reference_id: string | null
          tally_voucher_number: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          organization_id: string
          record_id: string
          record_type: string
          request_payload?: string | null
          response_payload?: string | null
          status?: string | null
          sync_direction: string
          synced_at?: string | null
          synced_by?: string | null
          tally_reference_id?: string | null
          tally_voucher_number?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          organization_id?: string
          record_id?: string
          record_type?: string
          request_payload?: string | null
          response_payload?: string | null
          status?: string | null
          sync_direction?: string
          synced_at?: string | null
          synced_by?: string | null
          tally_reference_id?: string | null
          tally_voucher_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tally_sync_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      tally_sync_settings: {
        Row: {
          auto_create_ledgers: boolean | null
          connector_api_key: string | null
          connector_mode: string | null
          created_at: string | null
          default_bank_ledger: string | null
          default_cash_ledger: string | null
          default_voucher_type: string | null
          enable_sync: boolean | null
          id: string
          last_pull_at: string | null
          last_push_at: string | null
          organization_id: string
          tally_company_name: string | null
          tally_port: number | null
          tally_server_ip: string | null
          updated_at: string | null
        }
        Insert: {
          auto_create_ledgers?: boolean | null
          connector_api_key?: string | null
          connector_mode?: string | null
          created_at?: string | null
          default_bank_ledger?: string | null
          default_cash_ledger?: string | null
          default_voucher_type?: string | null
          enable_sync?: boolean | null
          id?: string
          last_pull_at?: string | null
          last_push_at?: string | null
          organization_id: string
          tally_company_name?: string | null
          tally_port?: number | null
          tally_server_ip?: string | null
          updated_at?: string | null
        }
        Update: {
          auto_create_ledgers?: boolean | null
          connector_api_key?: string | null
          connector_mode?: string | null
          created_at?: string | null
          default_bank_ledger?: string | null
          default_cash_ledger?: string | null
          default_voucher_type?: string | null
          enable_sync?: boolean | null
          id?: string
          last_pull_at?: string | null
          last_push_at?: string | null
          organization_id?: string
          tally_company_name?: string | null
          tally_port?: number | null
          tally_server_ip?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tally_sync_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_class_assignments: {
        Row: {
          academic_year: string
          assigned_by: string
          class_name: string
          created_at: string
          id: string
          organization_id: string
          section_name: string | null
          subject: string
          teacher_id: string
          updated_at: string
        }
        Insert: {
          academic_year?: string
          assigned_by: string
          class_name: string
          created_at?: string
          id?: string
          organization_id: string
          section_name?: string | null
          subject: string
          teacher_id: string
          updated_at?: string
        }
        Update: {
          academic_year?: string
          assigned_by?: string
          class_name?: string
          created_at?: string
          id?: string
          organization_id?: string
          section_name?: string | null
          subject?: string
          teacher_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_notes: {
        Row: {
          contact_method: string | null
          content: string
          created_at: string
          follow_up_date: string | null
          follow_up_required: boolean | null
          id: string
          note_type: string
          organization_id: string
          student_id: string
          subject: string
          teacher_id: string
          updated_at: string
        }
        Insert: {
          contact_method?: string | null
          content: string
          created_at?: string
          follow_up_date?: string | null
          follow_up_required?: boolean | null
          id?: string
          note_type: string
          organization_id: string
          student_id: string
          subject: string
          teacher_id: string
          updated_at?: string
        }
        Update: {
          contact_method?: string | null
          content?: string
          created_at?: string
          follow_up_date?: string | null
          follow_up_required?: boolean | null
          id?: string
          note_type?: string
          organization_id?: string
          student_id?: string
          subject?: string
          teacher_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_notes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_notes_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students_or_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_preferences: {
        Row: {
          created_at: string
          id: string
          max_periods_per_day: number | null
          organization_id: string
          preferred_subjects: string[] | null
          rest_period_after: number | null
          teacher_id: string
          updated_at: string
          weekly_off: string[] | null
        }
        Insert: {
          created_at?: string
          id?: string
          max_periods_per_day?: number | null
          organization_id: string
          preferred_subjects?: string[] | null
          rest_period_after?: number | null
          teacher_id: string
          updated_at?: string
          weekly_off?: string[] | null
        }
        Update: {
          created_at?: string
          id?: string
          max_periods_per_day?: number | null
          organization_id?: string
          preferred_subjects?: string[] | null
          rest_period_after?: number | null
          teacher_id?: string
          updated_at?: string
          weekly_off?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "teacher_preferences_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_preferences_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_preferences_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      timetable_custom_overrides: {
        Row: {
          class_name: string
          created_at: string
          created_by: string | null
          id: string
          organization_id: string
          section_name: string | null
          updated_at: string
        }
        Insert: {
          class_name: string
          created_at?: string
          created_by?: string | null
          id?: string
          organization_id: string
          section_name?: string | null
          updated_at?: string
        }
        Update: {
          class_name?: string
          created_at?: string
          created_by?: string | null
          id?: string
          organization_id?: string
          section_name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "timetable_custom_overrides_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      timetable_time_slots: {
        Row: {
          class_name: string | null
          created_at: string
          end_time: string
          id: string
          is_break: boolean
          is_lunch: boolean
          organization_id: string
          section_name: string | null
          slot_label: string | null
          slot_order: number
          start_time: string
          updated_at: string
        }
        Insert: {
          class_name?: string | null
          created_at?: string
          end_time: string
          id?: string
          is_break?: boolean
          is_lunch?: boolean
          organization_id: string
          section_name?: string | null
          slot_label?: string | null
          slot_order?: number
          start_time: string
          updated_at?: string
        }
        Update: {
          class_name?: string | null
          created_at?: string
          end_time?: string
          id?: string
          is_break?: boolean
          is_lunch?: boolean
          organization_id?: string
          section_name?: string | null
          slot_label?: string | null
          slot_order?: number
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "timetable_time_slots_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      timetables: {
        Row: {
          academic_year: string
          class_name: string
          created_at: string
          created_by: string
          day_of_week: string
          end_time: string
          id: string
          organization_id: string
          period_type: Database["public"]["Enums"]["period_type"]
          start_time: string
          subject: string | null
          teacher_id: string | null
          updated_at: string
        }
        Insert: {
          academic_year?: string
          class_name: string
          created_at?: string
          created_by: string
          day_of_week: string
          end_time: string
          id?: string
          organization_id: string
          period_type?: Database["public"]["Enums"]["period_type"]
          start_time: string
          subject?: string | null
          teacher_id?: string | null
          updated_at?: string
        }
        Update: {
          academic_year?: string
          class_name?: string
          created_at?: string
          created_by?: string
          day_of_week?: string
          end_time?: string
          id?: string
          organization_id?: string
          period_type?: Database["public"]["Enums"]["period_type"]
          start_time?: string
          subject?: string | null
          teacher_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      training_sessions: {
        Row: {
          class_name: string
          coach_id: string
          created_at: string
          end_time: string
          id: string
          notes: string | null
          organization_id: string
          session_date: string
          sport: string
          start_time: string
          status: string
          updated_at: string
          venue: string | null
        }
        Insert: {
          class_name: string
          coach_id: string
          created_at?: string
          end_time: string
          id?: string
          notes?: string | null
          organization_id: string
          session_date: string
          sport: string
          start_time: string
          status?: string
          updated_at?: string
          venue?: string | null
        }
        Update: {
          class_name?: string
          coach_id?: string
          created_at?: string
          end_time?: string
          id?: string
          notes?: string | null
          organization_id?: string
          session_date?: string
          sport?: string
          start_time?: string
          status?: string
          updated_at?: string
          venue?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          core_role_id: string
          id: string
          organization_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          core_role_id: string
          id?: string
          organization_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          core_role_id?: string
          id?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_core_role"
            columns: ["core_role_id"]
            isOneToOne: false
            referencedRelation: "core_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_automation_history: {
        Row: {
          automation_type: string
          created_at: string | null
          customer_id: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          organization_id: string
          recipient_phone: string
          related_module: string
          related_record_id: string
          reminder_stage: string | null
          rendered_message: string | null
          status: string | null
          template_key: string
          triggered_at: string | null
          whatsapp_log_id: string | null
        }
        Insert: {
          automation_type: string
          created_at?: string | null
          customer_id?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          organization_id: string
          recipient_phone: string
          related_module: string
          related_record_id: string
          reminder_stage?: string | null
          rendered_message?: string | null
          status?: string | null
          template_key: string
          triggered_at?: string | null
          whatsapp_log_id?: string | null
        }
        Update: {
          automation_type?: string
          created_at?: string | null
          customer_id?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string
          recipient_phone?: string
          related_module?: string
          related_record_id?: string
          reminder_stage?: string | null
          rendered_message?: string | null
          status?: string | null
          template_key?: string
          triggered_at?: string | null
          whatsapp_log_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_automation_history_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_automation_settings: {
        Row: {
          automation_type: string
          created_at: string | null
          id: string
          is_enabled: boolean | null
          max_overdue_followups: number | null
          notes: string | null
          organization_id: string
          send_days_after: number[] | null
          send_days_before: number[] | null
          send_on_due_date: boolean | null
          template_key: string
          updated_at: string | null
        }
        Insert: {
          automation_type: string
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          max_overdue_followups?: number | null
          notes?: string | null
          organization_id: string
          send_days_after?: number[] | null
          send_days_before?: number[] | null
          send_on_due_date?: boolean | null
          template_key: string
          updated_at?: string | null
        }
        Update: {
          automation_type?: string
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          max_overdue_followups?: number | null
          notes?: string | null
          organization_id?: string
          send_days_after?: number[] | null
          send_days_before?: number[] | null
          send_on_due_date?: boolean | null
          template_key?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_automation_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_message_logs: {
        Row: {
          automation_type: string | null
          created_at: string | null
          customer_id: string | null
          direction: string | null
          error_message: string | null
          id: string
          message_body: string
          metadata: Json | null
          organization_id: string
          phone: string
          recipient_name: string | null
          related_module: string | null
          related_record_id: string | null
          reminder_stage: string | null
          sent_by: string | null
          template_key: string | null
          trigger_type: string | null
          twilio_message_sid: string | null
          twilio_status: string | null
          updated_at: string | null
        }
        Insert: {
          automation_type?: string | null
          created_at?: string | null
          customer_id?: string | null
          direction?: string | null
          error_message?: string | null
          id?: string
          message_body: string
          metadata?: Json | null
          organization_id: string
          phone: string
          recipient_name?: string | null
          related_module?: string | null
          related_record_id?: string | null
          reminder_stage?: string | null
          sent_by?: string | null
          template_key?: string | null
          trigger_type?: string | null
          twilio_message_sid?: string | null
          twilio_status?: string | null
          updated_at?: string | null
        }
        Update: {
          automation_type?: string | null
          created_at?: string | null
          customer_id?: string | null
          direction?: string | null
          error_message?: string | null
          id?: string
          message_body?: string
          metadata?: Json | null
          organization_id?: string
          phone?: string
          recipient_name?: string | null
          related_module?: string | null
          related_record_id?: string | null
          reminder_stage?: string | null
          sent_by?: string | null
          template_key?: string | null
          trigger_type?: string | null
          twilio_message_sid?: string | null
          twilio_status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_message_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_status_events: {
        Row: {
          created_at: string | null
          id: string
          message_status: string | null
          organization_id: string | null
          raw_payload: Json
          twilio_message_sid: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message_status?: string | null
          organization_id?: string | null
          raw_payload: Json
          twilio_message_sid: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message_status?: string | null
          organization_id?: string | null
          raw_payload?: Json
          twilio_message_sid?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_status_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_templates: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          organization_id: string
          template_body: string
          template_key: string
          template_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          organization_id: string
          template_body: string
          template_key: string
          template_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string
          template_body?: string
          template_key?: string
          template_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      fee_payment_receipt_view: {
        Row: {
          allocated_amount: number | null
          allocation_id: string | null
          fee_head_id: string | null
          fee_head_name: string | null
          head_balance: number | null
          head_paid_after: number | null
          head_total: number | null
          organization_id: string | null
          payment_amount: number | null
          payment_date: string | null
          payment_id: string | null
          payment_mode: string | null
          receipt_number: string | null
          student_id: string | null
          term_item_id: string | null
          term_name: string | null
          term_number: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fee_payments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students_or_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_allocations_fee_head_id_fkey"
            columns: ["fee_head_id"]
            isOneToOne: false
            referencedRelation: "fee_heads"
            referencedColumns: ["id"]
          },
        ]
      }
      public_profiles: {
        Row: {
          avatar_url: string | null
          id: string | null
          name: string | null
          organization_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          id?: string | null
          name?: string | null
          organization_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          id?: string | null
          name?: string | null
          organization_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      admit_student_atomic: {
        Args: {
          p_admitted_by?: string
          p_email?: string
          p_enrolled_on?: string
          p_name: string
          p_org_id: string
          p_phone?: string
          p_section: string
          p_student_id: string
        }
        Returns: Json
      }
      allocate_payment: { Args: { p_payment_id: string }; Returns: Json }
      allocate_payment_smart: {
        Args: {
          p_payment_id: string
          p_selected_item_ids?: string[]
          p_selected_term_id?: string
        }
        Returns: Json
      }
      apply_bank_change_request: {
        Args: { p_request_id: string }
        Returns: undefined
      }
      archive_old_admissions: {
        Args: { _archived_by: string; _days: number; _org_id: string }
        Returns: number
      }
      archive_old_applications: {
        Args: { _archived_by: string; _days: number; _org_id: string }
        Returns: number
      }
      archive_old_circulars: {
        Args: { _archived_by: string; _days: number; _org_id: string }
        Returns: number
      }
      archive_old_meetings: {
        Args: { _archived_by: string; _days: number; _org_id: string }
        Returns: number
      }
      archive_organization: {
        Args: { _archived_by: string; _org_id: string }
        Returns: undefined
      }
      archive_override: {
        Args: { p_override_id: string; p_reason?: string }
        Returns: string
      }
      backfill_legacy_payments: { Args: never; Returns: Json }
      backfill_student_fee_term_items: {
        Args: never
        Returns: {
          message: string
          override_id: string
          status: string
        }[]
      }
      calculate_access_days: {
        Args: {
          p_installment_amount: number
          p_installment_duration_days: number
          p_paid_amount: number
        }
        Returns: number
      }
      calculate_age_at_cutoff: {
        Args: { p_cutoff_date?: string; p_dob: string }
        Returns: Json
      }
      can_apply_leave: {
        Args: {
          _end: string
          _exclude_leave_id?: string
          _org: string
          _skip_monthly?: boolean
          _start: string
          _user: string
        }
        Returns: Json
      }
      can_teacher_message_student: {
        Args: { _student_id: string; _teacher_id: string }
        Returns: boolean
      }
      cleanup_all_data: { Args: never; Returns: undefined }
      cleanup_old_archives: { Args: never; Returns: undefined }
      compute_student_fee_status: {
        Args: { p_academic_year?: string; p_student_id: string }
        Returns: Json
      }
      conversation_org: { Args: { _conv_id: string }; Returns: string }
      count_working_days: {
        Args: { _end: string; _org: string; _start: string }
        Returns: number
      }
      create_default_roles: {
        Args: {
          org_id: string
          org_industry: Database["public"]["Enums"]["industry_type"]
        }
        Returns: undefined
      }
      current_academic_year: { Args: never; Returns: string }
      decrypt_aadhaar: {
        Args: { p_encrypted: string; p_org_id: string }
        Returns: string
      }
      derive_academic_year: { Args: { p_date: string }; Returns: string }
      encrypt_aadhaar:
        | { Args: { p_aadhaar: string; p_org_id: string }; Returns: string }
        | {
            Args: {
              p_org_id: string
              p_raw_aadhaar: string
              p_student_id: string
            }
            Returns: undefined
          }
      enqueue_push_notification: {
        Args: {
          _body: string
          _data: Json
          _event_type: string
          _organization_id: string
          _recipient: string
          _title: string
        }
        Returns: undefined
      }
      generate_admission_number: { Args: { p_org_id: string }; Returns: string }
      generate_cert_reference_no: {
        Args: { p_employee_id: string; p_org_id: string }
        Returns: string
      }
      generate_daily_timetable: {
        Args: { p_date: string; p_day_of_week: string; p_org_id: string }
        Returns: number
      }
      generate_employee_id: { Args: { _org_id: string }; Returns: string }
      generate_roll_number: {
        Args: { p_class: string; p_org_id: string; p_section: string }
        Returns: string
      }
      get_blocked_months: {
        Args: { _org: string; _year: number }
        Returns: number[]
      }
      get_class_subjects: {
        Args: { p_class_section_id: string; p_org_id: string }
        Returns: {
          category: string
          code: string
          id: string
          name: string
        }[]
      }
      get_class_subjects_by_name: {
        Args: {
          p_class_name: string
          p_org_id: string
          p_section_name?: string
        }
        Returns: {
          category: string
          code: string
          id: string
          name: string
        }[]
      }
      get_fee_records: {
        Args: never
        Returns: {
          amount_paid: number
          balance_remaining: number
          class: string
          last_payment_date: string
          organization_id: string
          section: string
          status: string
          student_id: string
          student_name: string
          total_fee: number
        }[]
      }
      get_leave_summary: {
        Args: { _month: number; _user_id: string; _year: number }
        Returns: {
          by_type: Json
          half_days: number
          lop_days: number
          paid_days: number
          total_leaves: number
          unpaid_days: number
        }[]
      }
      get_masked_aadhaar: { Args: { p_last_four: string }; Returns: string }
      get_next_salary_version: {
        Args: { p_effective_month: string; p_staff_id: string }
        Returns: number
      }
      get_next_sequence: {
        Args: { p_org_id: string; p_sequence_type: string; p_year?: number }
        Returns: number
      }
      get_org_class_sections: {
        Args: { p_org_id: string }
        Returns: {
          class_name: string
          id: string
          is_system_generated: boolean
          section_name: string
        }[]
      }
      get_org_twilio_whatsapp_config: {
        Args: { p_org_id: string }
        Returns: Json
      }
      get_parent_class_section: {
        Args: { _user_id: string }
        Returns: {
          class_name: string
          section_name: string
        }[]
      }
      get_parent_org_id: { Args: { _user_id: string }; Returns: string }
      get_parent_student_id: { Args: { _user_id: string }; Returns: string }
      get_student_fee_view: {
        Args: { p_academic_year: string; p_student_id: string }
        Returns: Json
      }
      get_term_dues: {
        Args: { p_academic_year?: string; p_student_id: string }
        Returns: {
          billing_type: string
          due_date: string
          fee_head_id: string
          fee_head_name: string
          fully_paid: boolean
          is_recurring: boolean
          item_final: number
          item_id: string
          item_paid: number
          item_pending: number
          override_id: string
          synthetic_fee_key: string
          term_amount: number
          term_id: string
          term_name: string
          term_number: number
          term_paid: number
          term_pending: number
        }[]
      }
      get_unpaid_leave_usage_ay: {
        Args: {
          _ay_end: string
          _ay_start: string
          _org_id: string
          _user_id: string
        }
        Returns: {
          limit_days: number
          used_days: number
        }[]
      }
      get_user_id_by_email: { Args: { _email: string }; Returns: string }
      get_user_organization: { Args: { _user_id: string }; Returns: string }
      get_user_permissions: { Args: { _user_id: string }; Returns: Json }
      get_user_role_name: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role_by_name: {
        Args: { _role_name: string; _user_id: string }
        Returns: boolean
      }
      is_class_teacher: {
        Args: {
          _class: string
          _org_id: string
          _section: string
          _user_id: string
        }
        Returns: boolean
      }
      is_conversation_participant: {
        Args: { _conv_id: string; _user_id: string }
        Returns: boolean
      }
      is_feature_enabled: {
        Args: { p_flag: string; p_org_id: string }
        Returns: boolean
      }
      is_parent: { Args: { _user_id: string }; Returns: boolean }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
      is_super_admin_v2: { Args: { _user_id: string }; Returns: boolean }
      is_teacher_scheduled_now: {
        Args: { _class_name: string; _subject: string }
        Returns: boolean
      }
      is_teacher_scheduled_today: {
        Args: { _class_name: string; _subject: string }
        Returns: boolean
      }
      is_within_quiet_hours: {
        Args: { check_time?: string; end_time: string; start_time: string }
        Returns: boolean
      }
      log_fee_event: {
        Args: {
          p_details?: Json
          p_event: string
          p_org_id: string
          p_override_id?: string
          p_payment_id?: string
          p_student_id?: string
        }
        Returns: string
      }
      map_enum_to_role_name: { Args: { role_enum: string }; Returns: string }
      map_planner_holiday_type: { Args: { _category: string }; Returns: string }
      materialize_override_term_items: {
        Args: { p_override_id: string }
        Returns: Json
      }
      normalize_class_name: { Args: { raw: string }; Returns: string }
      parent_owns_student: {
        Args: { _student_id: string; _user_id: string }
        Returns: boolean
      }
      populate_class_sections_for_org: {
        Args: { p_org_id: string }
        Returns: undefined
      }
      prepare_override_reissue: {
        Args: { p_override_id: string }
        Returns: Json
      }
      promote_to_super_admin: {
        Args: { _user_email: string }
        Returns: undefined
      }
      rebuild_term_items: {
        Args: { p_force?: boolean; p_override_id: string }
        Returns: Json
      }
      recompute_fee_term_paid: {
        Args: { _term_id: string }
        Returns: undefined
      }
      restore_archived_record: {
        Args: { _module: string; _original_id: string; _restored_by: string }
        Returns: boolean
      }
      restore_lead: { Args: { lead_id: string }; Returns: undefined }
      restore_organization: { Args: { _org_id: string }; Returns: undefined }
      reverse_payment_allocations: {
        Args: { p_payment_id: string }
        Returns: Json
      }
      search_conversations: {
        Args: {
          _conv_type?: string
          _from?: string
          _limit?: number
          _offset?: number
          _org: string
          _query?: string
          _to?: string
        }
        Returns: {
          admin_id: string
          conversation_id: string
          conversation_type: string
          last_message: string
          last_message_at: string
          organization_id: string
          parent_id: string
          parent_unread_count: number
          rank: number
          snippet: string
          student_id: string
          teacher_id: string
          teacher_unread_count: number
        }[]
      }
      seed_default_leave_types: { Args: { _org: string }; Returns: undefined }
      soft_delete_lead: { Args: { lead_id: string }; Returns: undefined }
      sync_class_sections_from_existing_data: {
        Args: never
        Returns: {
          class_name: string
          created: boolean
          organization_id: string
          section_name: string
          source_table: string
        }[]
      }
      sync_sequences_with_data: { Args: never; Returns: undefined }
      sync_subjects_from_existing_data: { Args: never; Returns: number }
      teacher_has_class_access: {
        Args: {
          _class_name: string
          _section_name?: string
          _teacher_id: string
        }
        Returns: boolean
      }
      teacher_has_marks_access: {
        Args: {
          _class_name: string
          _org_id: string
          _section: string
          _subject: string
          _teacher_id: string
        }
        Returns: boolean
      }
      today_day_name: { Args: never; Returns: string }
      validate_message_participants: {
        Args: {
          _conversation_id: string
          _receiver_id: string
          _receiver_role: string
          _sender_id: string
          _sender_role: string
        }
        Returns: boolean
      }
      validate_override_invariant: {
        Args: { p_override_id: string }
        Returns: {
          items_total: number
          message: string
          ok: boolean
          override_total: number
          terms_total: number
        }[]
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "principal"
        | "teacher"
        | "counselor"
        | "parent"
        | "accountant"
        | "coach"
        | "manager"
        | "super_admin"
        | "admissions_officer"
        | "support"
        | "visa_consultant"
      communication_channel: "email" | "sms" | "whatsapp" | "phone"
      industry_type: "education" | "visa_consultancy" | "general"
      lead_source: "meta" | "google_ads" | "manual" | "website" | "referral"
      lead_status:
        | "new"
        | "contacted"
        | "qualified"
        | "application_started"
        | "converted"
        | "lost"
      period_type: "CLASS" | "BREAK" | "LUNCH"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "admin",
        "principal",
        "teacher",
        "counselor",
        "parent",
        "accountant",
        "coach",
        "manager",
        "super_admin",
        "admissions_officer",
        "support",
        "visa_consultant",
      ],
      communication_channel: ["email", "sms", "whatsapp", "phone"],
      industry_type: ["education", "visa_consultancy", "general"],
      lead_source: ["meta", "google_ads", "manual", "website", "referral"],
      lead_status: [
        "new",
        "contacted",
        "qualified",
        "application_started",
        "converted",
        "lost",
      ],
      period_type: ["CLASS", "BREAK", "LUNCH"],
    },
  },
} as const
