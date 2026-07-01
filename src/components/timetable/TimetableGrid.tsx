import { useMemo } from "react";
import { X, Plus, Coffee, Utensils, Layers, GripVertical, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

export type PeriodType = "CLASS" | "BREAK" | "LUNCH";

export interface TimetableEntry {
  id: string;
  class_name: string;
  subject: string | null;
  teacher_id: string | null;
  teacher_name?: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  period_type: PeriodType;
}

interface MergedEntry {
  entries: TimetableEntry[];
  subject: string | null;
  period_type: PeriodType;
  isMixed: boolean;
  sections: string[];
  teacher_name?: string;
  start_time: string;
  end_time: string;
}

export interface PeriodSlot {
  start_time: string;
  end_time: string;
  label: string;
  is_break: boolean;
  is_lunch: boolean;
  index: number;
}

interface TimetableGridProps {
  entries: TimetableEntry[];
  selectedClass: string;
  isAllSectionsView?: boolean;
  onCellClick: (day: string, timeSlot: string, entry?: TimetableEntry) => void;
  onDelete: (id: string) => void;
  highlightedSubject?: string;
  readonly?: boolean;
  enableDragDrop?: boolean;
  periodSlots?: PeriodSlot[];
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const SUBJECT_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  "Mathematics": { bg: "bg-blue-100 dark:bg-blue-900/40", border: "border-blue-300 dark:border-blue-700", text: "text-blue-800 dark:text-blue-200" },
  "Science": { bg: "bg-green-100 dark:bg-green-900/40", border: "border-green-300 dark:border-green-700", text: "text-green-800 dark:text-green-200" },
  "English": { bg: "bg-purple-100 dark:bg-purple-900/40", border: "border-purple-300 dark:border-purple-700", text: "text-purple-800 dark:text-purple-200" },
  "Social Studies": { bg: "bg-amber-100 dark:bg-amber-900/40", border: "border-amber-300 dark:border-amber-700", text: "text-amber-800 dark:text-amber-200" },
  "Hindi": { bg: "bg-rose-100 dark:bg-rose-900/40", border: "border-rose-300 dark:border-rose-700", text: "text-rose-800 dark:text-rose-200" },
  "Computer Science": { bg: "bg-cyan-100 dark:bg-cyan-900/40", border: "border-cyan-300 dark:border-cyan-700", text: "text-cyan-800 dark:text-cyan-200" },
  "Physical Education": { bg: "bg-orange-100 dark:bg-orange-900/40", border: "border-orange-300 dark:border-orange-700", text: "text-orange-800 dark:text-orange-200" },
};

export const DEFAULT_COLORS = { bg: "bg-gray-100 dark:bg-gray-800", border: "border-gray-300 dark:border-gray-600", text: "text-gray-800 dark:text-gray-200" };
const MIXED_COLORS = { bg: "bg-gradient-to-br from-amber-100 to-rose-100 dark:from-amber-900/30 dark:to-rose-900/30", border: "border-amber-400 dark:border-amber-600", text: "text-amber-800 dark:text-amber-200" };
const BREAK_COLORS = { bg: "bg-yellow-50 dark:bg-yellow-900/20", border: "border-yellow-300 dark:border-yellow-700", text: "text-yellow-800 dark:text-yellow-200" };
const LUNCH_COLORS = { bg: "bg-orange-50 dark:bg-orange-900/20", border: "border-orange-300 dark:border-orange-700", text: "text-orange-800 dark:text-orange-200" };

function extractSection(className: string): string {
  const match = className.match(/[-–]\s*(?:Section\s*)?([A-D])$/i);
  return match ? match[1].toUpperCase() : "";
}

function DraggablePeriodWrapper({
  entry, children, enabled,
}: {
  entry: TimetableEntry; children: React.ReactNode; enabled: boolean;
}) {
  const canDrag = enabled && entry.period_type === "CLASS";
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: entry.id,
    data: { entry, type: "period" },
    disabled: !canDrag,
  });
  const style: React.CSSProperties = {
    ...(transform && { transform: CSS.Translate.toString(transform) }),
    ...(isDragging && { zIndex: 100, opacity: 0.8 }),
    touchAction: "none",
  };
  if (!canDrag) return <>{children}</>;
  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}
      className={cn("relative h-full cursor-grab active:cursor-grabbing select-none", isDragging && "shadow-lg ring-2 ring-primary rounded-lg")}
      title="Drag to move this period"
    >
      <div className="absolute top-1 left-1 p-0.5 rounded z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80">
        <GripVertical className="h-3 w-3 text-muted-foreground" />
      </div>
      {children}
    </div>
  );
}

function DroppableCellWrapper({
  id, day, time, isEmpty, children, enabled,
}: {
  id: string; day: string; time: string; isEmpty: boolean; children: React.ReactNode; enabled: boolean;
}) {
  const { isOver, setNodeRef, active } = useDroppable({
    id, data: { day, time, isEmpty, type: "cell" }, disabled: !enabled,
  });
  const showDropIndicator = isOver && active && isEmpty && enabled;
  const showInvalidIndicator = isOver && active && !isEmpty && enabled;
  if (!enabled) return <>{children}</>;
  return (
    <div ref={setNodeRef}
      className={cn("h-full transition-all duration-150",
        showDropIndicator && "ring-2 ring-primary ring-inset rounded-lg bg-primary/10",
        showInvalidIndicator && "ring-2 ring-destructive ring-inset rounded-lg bg-destructive/10"
      )}
    >
      {children}
    </div>
  );
}

export function TimetableGrid({
  entries, selectedClass, isAllSectionsView = false,
  onCellClick, onDelete, highlightedSubject,
  readonly = false, enableDragDrop = false, periodSlots,
}: TimetableGridProps) {
  const slots = useMemo(() => periodSlots || [], [periodSlots]);

  const filteredEntries = useMemo(() => {
    if (!selectedClass) return [];
    if (isAllSectionsView) {
      const classPrefix = selectedClass.replace(/\s*[-–]\s*(?:Section\s*)?[A-D]$/i, "").trim();
      return entries.filter(e => {
        const base = e.class_name.replace(/\s*[-–]\s*(?:Section\s*)?[A-D]$/i, "").trim();
        return base.toLowerCase() === classPrefix.toLowerCase();
      });
    }
    return entries.filter(e => e.class_name === selectedClass);
  }, [entries, selectedClass, isAllSectionsView]);

  const entryMap = useMemo(() => {
    const map = new Map<string, TimetableEntry>();
    if (!isAllSectionsView) {
      filteredEntries.forEach(entry => {
        const key = `${entry.day_of_week}|${entry.start_time.slice(0, 5)}`;
        map.set(key, entry);
      });
    }
    return map;
  }, [filteredEntries, isAllSectionsView]);

  const mergedEntryMap = useMemo(() => {
    const map = new Map<string, MergedEntry>();
    if (!isAllSectionsView) return map;
    filteredEntries.forEach(entry => {
      const key = `${entry.day_of_week}|${entry.start_time.slice(0, 5)}`;
      const section = extractSection(entry.class_name);
      if (map.has(key)) {
        const existing = map.get(key)!;
        existing.entries.push(entry);
        if (section && !existing.sections.includes(section)) existing.sections.push(section);
        if (entry.period_type === "CLASS" && entry.subject !== existing.subject) existing.isMixed = true;
      } else {
        map.set(key, {
          entries: [entry], subject: entry.subject, period_type: entry.period_type,
          isMixed: false, sections: section ? [section] : [],
          teacher_name: entry.teacher_name, start_time: entry.start_time, end_time: entry.end_time,
        });
      }
    });
    map.forEach(m => m.sections.sort());
    return map;
  }, [filteredEntries, isAllSectionsView]);

  const getEntry = (day: string, time: string) => entryMap.get(`${day}|${time}`);
  const getMergedEntry = (day: string, time: string) => mergedEntryMap.get(`${day}|${time}`);

  const formatTimeRange = (start: string, end: string) => {
    const fmt = (t: string) => {
      const [h, m] = t.slice(0, 5).split(":").map(Number);
      const ampm = h >= 12 ? "PM" : "AM";
      const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
      return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
    };
    return `${fmt(start)} – ${fmt(end)}`;
  };

  const getEntryColors = (entry: TimetableEntry) => {
    if (entry.period_type === "BREAK") return BREAK_COLORS;
    if (entry.period_type === "LUNCH") return LUNCH_COLORS;
    return entry.subject ? (SUBJECT_COLORS[entry.subject] || DEFAULT_COLORS) : DEFAULT_COLORS;
  };

  const getMergedColors = (merged: MergedEntry) => {
    if (merged.isMixed) return MIXED_COLORS;
    if (merged.period_type === "BREAK") return BREAK_COLORS;
    if (merged.period_type === "LUNCH") return LUNCH_COLORS;
    return merged.subject ? (SUBJECT_COLORS[merged.subject] || DEFAULT_COLORS) : DEFAULT_COLORS;
  };

  const renderEntryContent = (entry: TimetableEntry) => {
    const colors = getEntryColors(entry);
    if (entry.period_type === "BREAK") {
      return (
        <div className="h-full p-2 flex flex-col items-center justify-center">
          <Coffee className={cn("h-5 w-5 mb-1", colors.text)} />
          <p className={cn("font-semibold text-sm", colors.text)}>Break</p>
        </div>
      );
    }
    if (entry.period_type === "LUNCH") {
      return (
        <div className="h-full p-2 flex flex-col items-center justify-center">
          <Utensils className={cn("h-5 w-5 mb-1", colors.text)} />
          <p className={cn("font-semibold text-sm", colors.text)}>Lunch</p>
        </div>
      );
    }
    return (
      <div className="h-full p-2 flex flex-col justify-between">
        <div>
          <p className={cn("font-semibold text-sm truncate", colors.text)}>{entry.subject || "—"}</p>
          <p className="text-xs text-muted-foreground truncate">{entry.teacher_name || "No teacher"}</p>
        </div>
      </div>
    );
  };

  const renderMergedContent = (merged: MergedEntry) => {
    const colors = getMergedColors(merged);
    if (merged.period_type === "BREAK") {
      return (
        <div className="h-full p-2 flex flex-col items-center justify-center">
          <Coffee className={cn("h-5 w-5 mb-1", colors.text)} />
          <p className={cn("font-semibold text-sm", colors.text)}>Break</p>
          <Badge variant="outline" className="mt-1 text-[10px] px-1.5 py-0">{merged.sections.join(", ")}</Badge>
        </div>
      );
    }
    if (merged.period_type === "LUNCH") {
      return (
        <div className="h-full p-2 flex flex-col items-center justify-center">
          <Utensils className={cn("h-5 w-5 mb-1", colors.text)} />
          <p className={cn("font-semibold text-sm", colors.text)}>Lunch</p>
          <Badge variant="outline" className="mt-1 text-[10px] px-1.5 py-0">{merged.sections.join(", ")}</Badge>
        </div>
      );
    }
    if (merged.isMixed) {
      const breakdown = merged.entries.reduce((acc, e) => {
        const sec = extractSection(e.class_name);
        if (sec && e.subject) acc[sec] = e.subject;
        return acc;
      }, {} as Record<string, string>);
      return (
        <div className="h-full p-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1">
              <Layers className="h-3 w-3 text-amber-600" />
              <p className={cn("font-semibold text-xs", colors.text)}>Mixed</p>
            </div>
            <div className="mt-1 space-y-0.5">
              {Object.entries(breakdown).slice(0, 2).map(([sec, subj]) => (
                <p key={sec} className="text-[10px] text-muted-foreground truncate">{sec}: {subj}</p>
              ))}
              {Object.keys(breakdown).length > 2 && (
                <p className="text-[10px] text-muted-foreground">+{Object.keys(breakdown).length - 2} more</p>
              )}
            </div>
          </div>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 w-fit">{merged.sections.join(", ")}</Badge>
        </div>
      );
    }
    return (
      <div className="h-full p-2 flex flex-col justify-between">
        <div>
          <p className={cn("font-semibold text-sm truncate", colors.text)}>{merged.subject || "—"}</p>
          <p className="text-xs text-muted-foreground truncate">{merged.teacher_name || "No teacher"}</p>
        </div>
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 w-fit">{merged.sections.join(", ")}</Badge>
      </div>
    );
  };

  if (slots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Clock className="h-12 w-12 text-muted-foreground/40 mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No Periods Configured</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Add periods using the "Period Builder" panel on the right to start building the timetable.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[900px]">
        {/* Header Row */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          <div className="h-12 flex items-center justify-center bg-primary rounded-lg font-semibold text-sm text-primary-foreground">
            PERIOD NAME
          </div>
          {DAYS.map(day => (
            <div key={day} className="h-12 flex items-center justify-center bg-muted/80 rounded-lg font-semibold text-sm text-foreground uppercase tracking-wide">
              {day}
            </div>
          ))}
        </div>

        {/* Period Rows */}
        {slots.map(slot => {
          const time = slot.start_time.slice(0, 5);
          const isBlockedRow = slot.is_break || slot.is_lunch;

          return (
            <div key={`${slot.index}-${time}`} className="grid grid-cols-7 gap-1 mb-1">
              {/* Period Label Column */}
              <div className={cn(
                "h-20 flex flex-col items-center justify-center rounded-lg text-center px-2",
                isBlockedRow
                  ? slot.is_lunch
                    ? "bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800"
                    : "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
                  : "bg-muted/30"
              )}>
                <span className="text-sm font-semibold text-foreground">{slot.label}</span>
                <span className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                  {formatTimeRange(slot.start_time, slot.end_time)}
                </span>
              </div>

              {/* Day Cells */}
              {DAYS.map(day => {
                // Break/Lunch row — show blocked cell across all days with the actual slot label
                if (isBlockedRow) {
                  const Icon = slot.is_lunch ? Utensils : Coffee;
                  return (
                    <div
                      key={`${day}-${time}`}
                      className={cn(
                        "h-20 rounded-lg border flex items-center justify-center",
                        slot.is_lunch
                          ? "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800"
                          : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={cn("h-4 w-4", slot.is_lunch ? "text-orange-500" : "text-yellow-600")} />
                        <span className={cn(
                          "text-sm font-medium",
                          slot.is_lunch ? "text-orange-700 dark:text-orange-300" : "text-yellow-700 dark:text-yellow-300"
                        )}>
                          {slot.label}
                        </span>
                      </div>
                    </div>
                  );
                }

                // All Sections view
                if (isAllSectionsView) {
                  const merged = getMergedEntry(day, time);
                  const colors = merged ? getMergedColors(merged) : null;
                  const isHighlighted = highlightedSubject && merged?.period_type === "CLASS" && merged?.subject === highlightedSubject && !merged.isMixed;
                  return (
                    <div
                      key={`${day}-${time}`}
                      onClick={() => !readonly && !isAllSectionsView && onCellClick(day, time)}
                      className={cn(
                        "h-20 rounded-lg border-2 border-dashed transition-all duration-200 relative group",
                        merged ? [colors?.bg, colors?.border, "border-solid", isHighlighted && "ring-2 ring-primary ring-offset-2 scale-105"]
                          : ["border-muted-foreground/20", "cursor-default"]
                      )}
                    >
                      {merged ? renderMergedContent(merged) : (
                        <div className="h-full flex items-center justify-center">
                          <span className="text-xs text-muted-foreground/50">—</span>
                        </div>
                      )}
                    </div>
                  );
                }

                // Single section view
                const entry = getEntry(day, time);
                const colors = entry ? getEntryColors(entry) : null;
                const isHighlighted = highlightedSubject && entry?.period_type === "CLASS" && entry?.subject === highlightedSubject;
                const cellId = `${day}-${time}`;
                const isEmpty = !entry;

                const cellContent = (
                  <div
                    key={cellId}
                    onClick={() => !readonly && onCellClick(day, time, entry)}
                    className={cn(
                      "h-20 rounded-lg border-2 transition-all duration-200 relative group",
                      entry ? [colors?.bg, colors?.border, "border-solid", isHighlighted && "ring-2 ring-primary ring-offset-2 scale-105"]
                        : ["border-dashed border-muted-foreground/20 hover:border-primary/40 hover:bg-primary/5", !readonly && "cursor-pointer"]
                    )}
                  >
                    {entry ? (
                      <DraggablePeriodWrapper entry={entry} enabled={enableDragDrop && !readonly}>
                        <>
                          {renderEntryContent(entry)}
                          {!readonly && (
                            <button
                              onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }}
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full bg-destructive/10 hover:bg-destructive/20"
                            >
                              <X className="h-3 w-3 text-destructive" />
                            </button>
                          )}
                        </>
                      </DraggablePeriodWrapper>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        {!readonly ? (
                          <div className="flex flex-col items-center gap-1 text-muted-foreground/60 hover:text-primary transition-colors">
                            <Plus className="h-6 w-6" />
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground/50">—</span>
                        )}
                      </div>
                    )}
                  </div>
                );

                if (enableDragDrop && !readonly) {
                  return (
                    <DroppableCellWrapper key={cellId} id={cellId} day={day} time={time} isEmpty={isEmpty} enabled={true}>
                      {cellContent}
                    </DroppableCellWrapper>
                  );
                }
                return cellContent;
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
