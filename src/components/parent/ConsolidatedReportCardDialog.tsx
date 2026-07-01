import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { ConsolidatedReportCard } from "./ConsolidatedReportCard";
import type { ConsolidatedReportCardData } from "@/lib/parent-consolidated-report-card";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: ConsolidatedReportCardData | null;
  autoDownload?: boolean;
}

export function ConsolidatedReportCardDialog({ open, onOpenChange, data, autoDownload }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState<"pdf" | "print" | null>(null);

  const handleDownload = async () => {
    if (!ref.current || !data) return;
    setBusy("pdf");
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas-pro"),
        import("jspdf"),
      ]);
      const canvas = await html2canvas(ref.current, { scale: 2, backgroundColor: "#ffffff" });
      const img = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const ratio = canvas.height / canvas.width;
      const imgWidth = pageWidth - 40;
      const imgHeight = imgWidth * ratio;
      pdf.addImage(img, "PNG", 20, 20, imgWidth, imgHeight);
      const safeName = data.studentName.replace(/[^a-z0-9\-_]/gi, "_");
      pdf.save(`ReportCard_${safeName}.pdf`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate report card.");
    } finally {
      setBusy(null);
    }
  };

  const handlePrint = () => {
    if (!ref.current) return;
    setBusy("print");
    const html = ref.current.outerHTML;
    const w = window.open("", "_blank", "width=1000,height=1200");
    if (!w) {
      setBusy(null);
      toast.error("Pop-up blocked. Please allow pop-ups to print.");
      return;
    }
    w.document.write(`
      <html><head><title>Report Card ${data?.studentName ?? ""}</title>
      <style>body{margin:0;padding:20px;background:#fff;font-family:Inter,system-ui,sans-serif;}</style>
      </head><body>${html}<script>window.onload=()=>{window.print();setTimeout(()=>window.close(),300);}</script></body></html>
    `);
    w.document.close();
    setTimeout(() => setBusy(null), 800);
  };

  useEffect(() => {
    if (open && autoDownload && data) handleDownload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, autoDownload, data]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden p-0 flex flex-col">
        <DialogHeader className="px-6 pt-5 pb-3 border-b shrink-0">
          <div className="flex items-center justify-between gap-3">
            <DialogTitle>Consolidated Report Card</DialogTitle>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handlePrint} disabled={!data || busy !== null}>
                <Printer className="h-4 w-4 mr-1" /> Print
              </Button>
              <Button size="sm" onClick={handleDownload} disabled={!data || busy !== null}>
                <Download className="h-4 w-4 mr-1" />
                {busy === "pdf" ? "Generating…" : "Download PDF"}
              </Button>
            </div>
          </div>
        </DialogHeader>
        <div className="flex-1 min-h-0 overflow-auto bg-muted/30 p-6 flex justify-center">
          {data ? (
            <div className="shadow-lg">
              <ConsolidatedReportCard ref={ref} data={data} />
            </div>
          ) : (
            <div className="py-12 text-sm text-muted-foreground">Loading report card…</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
