import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Printer, X } from "lucide-react";
import { FeeStatement, type FeeStatementData } from "./FeeStatement";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: FeeStatementData | null;
  fileName?: string;
}

export function FeeStatementDialog({ open, onOpenChange, data, fileName }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState<"pdf" | "print" | null>(null);

  const handleDownload = async () => {
    if (!ref.current || !data) {
      toast.error("Statement not ready yet");
      return;
    }
    setBusy("pdf");
    try {
      // html2canvas-pro: drop-in replacement that supports modern CSS color
      // functions (oklch/lab/color-mix) emitted by Tailwind v4 tokens. The
      // classic html2canvas throws on those and leaves the button stuck.
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas-pro"),
        import("jspdf"),
      ]);

      // Pre-load the logo so a broken/CORS-blocked image can't hang the
      // canvas pass. If it fails, hide the <img> in the clone.
      const logoEl = ref.current.querySelector("img") as HTMLImageElement | null;
      if (logoEl && logoEl.src) {
        await new Promise<void>((resolve) => {
          if (logoEl.complete && logoEl.naturalWidth > 0) return resolve();
          const done = () => resolve();
          logoEl.addEventListener("load", done, { once: true });
          logoEl.addEventListener("error", () => {
            logoEl.style.visibility = "hidden";
            resolve();
          }, { once: true });
          setTimeout(done, 4000); // hard timeout
        });
      }

      const canvas = await html2canvas(ref.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        allowTaint: false,
        logging: false,
        imageTimeout: 4000,
        onclone: (doc) => {
          // If the logo failed to load, strip it from the clone so the
          // serializer doesn't block on it.
          doc.querySelectorAll("img").forEach((img) => {
            const i = img as HTMLImageElement;
            if (!i.complete || i.naturalWidth === 0) i.remove();
          });
        },
      });

      const img = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 40;
      const pxPerPt = canvas.width / imgWidth;
      const imgHeight = canvas.height / pxPerPt;

      if (imgHeight <= pageHeight - 40) {
        pdf.addImage(img, "PNG", 20, 20, imgWidth, imgHeight);
      } else {
        const pageContentHeightPx = (pageHeight - 40) * pxPerPt;
        let renderedPx = 0;
        const tmp = document.createElement("canvas");
        const tctx = tmp.getContext("2d")!;
        while (renderedPx < canvas.height) {
          const sliceHeight = Math.min(pageContentHeightPx, canvas.height - renderedPx);
          tmp.width = canvas.width;
          tmp.height = sliceHeight;
          tctx.fillStyle = "#ffffff";
          tctx.fillRect(0, 0, tmp.width, tmp.height);
          tctx.drawImage(canvas, 0, renderedPx, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);
          const sliceImg = tmp.toDataURL("image/png");
          if (renderedPx > 0) pdf.addPage();
          pdf.addImage(sliceImg, "PNG", 20, 20, imgWidth, sliceHeight / pxPerPt);
          renderedPx += sliceHeight;
        }
      }
      pdf.save(`${fileName ?? "Fee-Statement"}.pdf`);
      toast.success("PDF downloaded");
    } catch (e) {
      console.error("[FeeStatement] PDF generation failed:", e);
      toast.error(
        e instanceof Error
          ? `Failed to generate PDF: ${e.message}`
          : "Failed to generate PDF",
      );
    } finally {
      setBusy(null);
    }
  };

  const handlePrint = () => {
    if (!ref.current) return;
    setBusy("print");
    const html = ref.current.outerHTML;
    const w = window.open("", "_blank", "width=900,height=1100");
    if (!w) {
      setBusy(null);
      toast.error("Pop-up blocked. Please allow pop-ups to print.");
      return;
    }
    w.document.write(`
      <html><head><title>${fileName ?? "Fee Statement"}</title>
      <style>body{margin:0;padding:20px;background:#fff;font-family:Inter,system-ui,sans-serif;}</style>
      </head><body>${html}<script>window.onload=()=>{window.print();setTimeout(()=>window.close(),300);}</script></body></html>
    `);
    w.document.close();
    setTimeout(() => setBusy(null), 800);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="px-6 pt-5 pb-3 border-b">
          <div className="flex items-center justify-between gap-3">
            <DialogTitle>{data?.title ?? "Fee Statement"}</DialogTitle>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handlePrint} disabled={!data || busy !== null}>
                <Printer className="h-4 w-4 mr-1" /> Print
              </Button>
              <Button size="sm" onClick={handleDownload} disabled={!data || busy !== null}>
                <Download className="h-4 w-4 mr-1" />
                {busy === "pdf" ? "Generating…" : "Download PDF"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onOpenChange(false)} aria-label="Close">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        <div className="overflow-auto bg-muted/30 p-6 flex justify-center">
          {data ? (
            <div className="shadow-lg">
              <FeeStatement ref={ref} data={data} />
            </div>
          ) : (
            <div className="py-12 text-sm text-muted-foreground">Loading…</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
