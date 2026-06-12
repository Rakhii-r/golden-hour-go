import { useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { parentSupabase } from "@/lib/parent-supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export const PARENT_DOCUMENT_TYPES = [
  "Aadhaar Card",
  "Birth Certificate",
  "Medical Certificate",
  "Vaccination Record",
  "Address Proof",
  "Parent ID Proof",
  "Other",
] as const;

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  studentId: string;
  organizationId: string;
  userId: string;
  onUploaded?: () => void;
}

export function ParentDocumentUploadDialog({
  open, onOpenChange, studentId, organizationId, userId, onUploaded,
}: Props) {
  const [docType, setDocType] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setDocType(""); setNotes(""); setFile(null); setBusy(false);
  };

  const handleSubmit = async () => {
    if (!docType) { toast.error("Select a document type"); return; }
    if (!file) { toast.error("Choose a file to upload"); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error("File too large (max 10 MB)"); return; }

    setBusy(true);
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "_");
      const path = `${organizationId}/${studentId}/parent/${Date.now()}_${safeName}`;

      const { error: upErr } = await parentSupabase
        .storage.from("student-documents")
        .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type || undefined });
      if (upErr) throw upErr;

      const { error: insErr } = await parentSupabase
        .from("student_documents")
        .insert({
          student_id: studentId,
          organization_id: organizationId,
          document_type: docType,
          file_url: path,
          generated_or_uploaded: "uploaded",
          approval_status: "pending",
          uploaded_by: userId,
          notes: notes.trim() ? `[Uploaded by Parent] ${notes.trim()}` : "[Uploaded by Parent]",
          issue_date: new Date().toISOString().slice(0, 10),
        });
      if (insErr) {
        // try to clean up storage if DB insert fails
        await parentSupabase.storage.from("student-documents").remove([path]);
        throw insErr;
      }

      toast.success("Document uploaded");
      reset();
      onOpenChange(false);
      onUploaded?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!busy) { onOpenChange(v); if (!v) reset(); } }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Files appear in the school's student profile after upload.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Document Type</Label>
            <Select value={docType} onValueChange={setDocType} disabled={busy}>
              <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>
                {PARENT_DOCUMENT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>File</Label>
            <Input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              disabled={busy}
            />
            <p className="text-[11px] text-gray-500">PDF or image · max 10 MB</p>
          </div>

          <div className="space-y-1.5">
            <Label>Notes (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value.slice(0, 500))}
              rows={3}
              placeholder="Any reference info for the school…"
              disabled={busy}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Upload className="h-4 w-4 mr-1" />}
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
