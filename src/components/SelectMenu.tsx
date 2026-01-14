"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export type SelectOption = { value: string; label: string };

export function SelectMenu({
  value,
  onChange,
  options,
  leftIcon,
  width = 170,
}: {
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
  leftIcon?: React.ReactNode;
  width?: number;
}) {
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  const currentIdx = useMemo(() => {
    const idx = options.findIndex((o) => o.value === value);
    return idx >= 0 ? idx : 0;
  }, [options, value]);

  const currentLabel = useMemo(
    () => options.find((o) => o.value === value)?.label ?? "Select",
    [options, value]
  );

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    if (open) setActiveIdx(currentIdx);
  }, [open, currentIdx]);

  function clampIdx(i: number) {
    return Math.max(0, Math.min(options.length - 1, i));
  }

  function commit(idx: number) {
    const opt = options[idx];
    if (!opt) return;
    onChange(opt.value);
    setOpen(false);
    requestAnimationFrame(() => btnRef.current?.focus());
  }

  function onButtonKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => clampIdx(i + 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => clampIdx(i - 1));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      commit(activeIdx);
      return;
    }
  }

  return (
    <div ref={rootRef} className="relative" style={{ width }}>
      <button
        ref={btnRef}
        type="button"
        className="input flex items-center justify-between gap-2 focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-0"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onButtonKeyDown}
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 min-w-0">
          {leftIcon ? <span className="opacity-80 shrink-0">{leftIcon}</span> : null}
          <span className="truncate text-slate-100">{currentLabel}</span>
        </span>
        <ChevronDown size={16} className={"opacity-70 transition " + (open ? "rotate-180" : "")} />
      </button>

      {open ? (
        <div
          className="absolute z-50 mt-2 w-full card p-1"
          style={{ background: "rgba(12,18,32,0.92)" }}
          role="listbox"
        >
          {options.map((o, i) => {
            const selected = o.value === value;
            const active = i === activeIdx;
            return (
              <button
                key={o.value}
                type="button"
                className={
                  "w-full text-left px-3 py-2 rounded-xl text-sm outline-none " +
                  (active ? "bg-white/12 text-slate-100" : selected ? "bg-white/8 text-slate-100" : "text-slate-200 hover:bg-white/6")
                }
                onMouseEnter={() => setActiveIdx(i)}
                onClick={() => commit(i)}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}