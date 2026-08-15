"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { parse, format, startOfMonth, addMonths, isSameDay } from "../utils/datePicker";

type DatePickerProps = {
  value: string;
  min?: string;
  onChange: (v: string) => void;
  className?: string;
};

export default function DatePicker({ value, min, onChange, className }: DatePickerProps) {
  const selected = useMemo(() => parse(value), [value]);
  const minDate = useMemo(() => (min ? parse(min) : undefined), [min]);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(startOfMonth(selected));
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const weeks = useMemo(() => {
    const first = startOfMonth(view);
    const offset = first.getDay();
    const start = new Date(view.getFullYear(), view.getMonth(), 1 - (offset === 0 ? 6 : offset - 1));
    const days: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    const wks: Date[][] = [];
    for (let i = 0; i < 6; i++) wks.push(days.slice(i * 7, i * 7 + 7));
    return wks;
  }, [view]);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className={className} ref={ref}>
      <button type="button" className="dpInput" onClick={() => setOpen((o) => !o)}>
        {value}
      </button>
      {open && (
        <div className="dpPopover">
          <div className="dpHeader">
            <button type="button" className="dpNav" onClick={() => setView(addMonths(view, -1))}>‹</button>
            <div className="dpLabel">{months[view.getMonth()]} {view.getFullYear()}</div>
            <button type="button" className="dpNav" onClick={() => setView(addMonths(view, 1))}>›</button>
          </div>
          <div className="dpWeekRow">
            {weekdays.map((w) => (<div key={w} className="dpWeek">{w}</div>))}
          </div>
          <div className="dpGrid">
            {weeks.map((row, i) => (
              <div key={i} className="dpRow">
                {row.map((d) => {
                  const inMonth = d.getMonth() === view.getMonth();
                  const disabled = minDate ? d < minDate : false;
                  const sel = isSameDay(d, selected);
                  return (
                    <button
                      key={format(d)}
                      type="button"
                      className={`dpDay${inMonth ? "" : " dpDayMuted"}${sel ? " dpSelected" : ""}${disabled ? " dpDayDisabled" : ""}`}
                      onClick={() => {
                        if (disabled) return;
                        onChange(format(d));
                        setOpen(false);
                      }}
                    >
                      {d.getDate()}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
