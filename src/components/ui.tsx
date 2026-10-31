"use client";

import Link from "next/link";
import { forwardRef, useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/format";
import { useT } from "@/lib/i18n";

/* ---------- Logo ---------- */

export function Logo({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const h = size === "lg" ? "h-10" : size === "sm" ? "h-6" : "h-8";
  const t = size === "lg" ? "text-3xl" : size === "sm" ? "text-lg" : "text-2xl";
  return (
    <span className={cn("inline-flex items-center gap-1.5 font-bold tracking-tight text-brand-600", className)}>
      <svg viewBox="0 0 24 32" className={cn(h, "w-auto")} aria-hidden>
        <path d="M2 4.5 15 1v30L2 27.5z" fill="currentColor" />
        <path d="M15 4h6v24h-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx="11.5" cy="16.5" r="1.4" fill="#fff" />
      </svg>
      <span className={t}>MoveIn</span>
    </span>
  );
}

/* ---------- Buttons ---------- */

type Variant = "primary" | "secondary" | "ghost" | "danger" | "success";
const variants: Record<Variant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 shadow-sm shadow-brand-600/20",
  secondary: "bg-white text-brand-700 ring-1 ring-brand-200 hover:bg-brand-50",
  ghost: "text-brand-700 hover:bg-brand-50",
  danger: "bg-white text-red-600 ring-1 ring-red-200 hover:bg-red-50",
  success: "bg-emerald-600 text-white hover:bg-emerald-700",
};
const sizes = { sm: "h-8 px-3 text-sm", md: "h-10 px-4 text-sm", lg: "h-12 px-6 text-base" };

type BtnProps = { variant?: Variant; size?: keyof typeof sizes };
const btn = (variant: Variant, size: keyof typeof sizes, className?: string) =>
  cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );

export const Button = forwardRef<HTMLButtonElement, ComponentProps<"button"> & BtnProps>(function Button(
  { variant = "primary", size = "md", className, type = "button", ...p },
  ref,
) {
  return <button ref={ref} type={type} className={btn(variant, size, className)} {...p} />;
});

export function ButtonLink({ variant = "primary", size = "md", className, ...p }: ComponentProps<typeof Link> & BtnProps) {
  return <Link className={btn(variant, size, className)} {...p} />;
}

/* ---------- Surfaces ---------- */

export function Card({ className, ...p }: ComponentProps<"div">) {
  return <div className={cn("rounded-2xl border border-line bg-white shadow-[0_1px_2px_rgba(15,27,45,0.04)]", className)} {...p} />;
}

export function Badge({ tone = "brand", className, children }: { tone?: "brand" | "green" | "red" | "amber" | "gray"; className?: string; children: ReactNode }) {
  const tones = {
    brand: "bg-brand-50 text-brand-700 ring-brand-200",
    green: "bg-emerald-500 text-white ring-emerald-500",
    red: "bg-red-500 text-white ring-red-500",
    amber: "bg-amber-50 text-amber-800 ring-amber-200",
    gray: "bg-slate-100 text-slate-700 ring-slate-200",
  };
  return <span className={cn("inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ring-1", tones[tone], className)}>{children}</span>;
}

export function PageHeader({ eyebrow, title, subtitle, actions }: { eyebrow?: string; title: ReactNode; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && <p className="mb-1 text-xs font-bold uppercase tracking-wider text-brand-600">{eyebrow}</p>}
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-2xl text-sm text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({ image, title, children, action }: { image?: string; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <Card className="flex flex-col items-center px-6 py-12 text-center">
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="mb-4 h-36 w-auto object-contain" />
      )}
      <h3 className="text-lg font-semibold">{title}</h3>
      {children && <div className="mt-1 max-w-md text-sm text-muted">{children}</div>}
      {action && <div className="mt-5">{action}</div>}
    </Card>
  );
}

/* ---------- Form controls ---------- */

const control =
  "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-100 disabled:bg-slate-50";

export function Field({ label, hint, error, children, className }: { label: string; hint?: ReactNode; error?: string; children: (id: string) => ReactNode; className?: string }) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      {children(id)}
      {hint && !error && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, ComponentProps<"input">>(function Input({ className, ...p }, ref) {
  return <input ref={ref} className={cn(control, className)} {...p} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, ComponentProps<"textarea">>(function Textarea({ className, ...p }, ref) {
  return <textarea ref={ref} className={cn(control, "min-h-24 resize-y", className)} {...p} />;
});

export const Select = forwardRef<HTMLSelectElement, ComponentProps<"select">>(function Select({ className, ...p }, ref) {
  return <select ref={ref} className={cn(control, "appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 20%22 fill=%22%235b6b80%22><path d=%22M5.5 7.5 10 12l4.5-4.5%22 stroke=%22%235b6b80%22 stroke-width=%221.5%22 fill=%22none%22/></svg>')] bg-[length:18px] bg-[right_12px_center] bg-no-repeat pr-10", className)} {...p} />;
});

/** Big selectable tile (deck style: "House / Apartment / Condo"). */
export function ChoiceTile({ selected, onClick, title, hint, icon, className }: { selected: boolean; onClick: () => void; title: string; hint?: string; icon?: ReactNode; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border bg-white p-4 text-left transition hover:border-brand-300",
        selected ? "border-brand-500 bg-brand-50 ring-2 ring-brand-500" : "border-line",
        className,
      )}
    >
      <span className={cn("mt-0.5 grid size-5 shrink-0 place-items-center rounded-full", selected ? "bg-brand-600 text-white" : "bg-brand-100 text-brand-500")}>
        {icon ?? (selected ? <span className="size-2 rounded-full bg-white" /> : null)}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold">{title}</span>
        {hint && <span className="mt-0.5 block text-xs text-muted">{hint}</span>}
      </span>
    </button>
  );
}

export function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-1.5 text-sm font-medium transition",
        selected ? "border-brand-500 bg-brand-50 text-brand-700 ring-1 ring-brand-500" : "border-line bg-white text-ink hover:border-brand-300",
      )}
    >
      {children}
    </button>
  );
}

export function Tabs<T extends string>({ value, onChange, items }: { value: T; onChange: (v: T) => void; items: { value: T; label: ReactNode }[] }) {
  return (
    <div role="tablist" className="grid gap-2" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
      {items.map((it) => (
        <button
          key={it.value}
          role="tab"
          aria-selected={value === it.value}
          onClick={() => onChange(it.value)}
          className={cn(
            "h-10 truncate rounded-lg border px-3 text-sm font-semibold transition",
            value === it.value ? "border-brand-600 bg-brand-600 text-white" : "border-line bg-white text-muted hover:border-brand-300 hover:text-brand-700",
          )}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}

/** Segmented progress bar used in multi-step flows (matches the deck). */
export function Progress({ total, current }: { total: number; current: number }) {
  const t = useT();
  return (
    <div className="flex gap-2" aria-label={t("Step {n} of {total}", { n: current + 1, total })}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={cn("h-1.5 flex-1 rounded-full transition-colors", i <= current ? "bg-brand-600" : "bg-brand-100")} />
      ))}
    </div>
  );
}

export function Stepper({ value, onChange, min = 0, max = 20, label }: { value: number; onChange: (n: number) => void; min?: number; max?: number; label: string }) {
  const t = useT();
  return (
    <div className="flex items-center justify-between border-b border-line py-3">
      <span className="text-sm font-medium">{label}</span>
      <span className="flex items-center gap-3">
        <button type="button" aria-label={t("Fewer: {label}", { label })} disabled={value <= min} onClick={() => onChange(value - 1)} className="grid size-8 place-items-center rounded-full bg-brand-50 text-brand-700 disabled:opacity-40">
          −
        </button>
        <span className="w-5 text-center text-sm font-semibold tabular-nums">{value}</span>
        <button type="button" aria-label={t("More: {label}", { label })} disabled={value >= max} onClick={() => onChange(value + 1)} className="grid size-8 place-items-center rounded-full bg-brand-50 text-brand-700 disabled:opacity-40">
          +
        </button>
      </span>
    </div>
  );
}

export function Avatar({ name, className }: { name: string; className?: string }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return <span className={cn("grid size-9 shrink-0 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-700", className)}>{initials}</span>;
}

export function Notice({ tone = "info", children, className }: { tone?: "info" | "warn" | "success"; children: ReactNode; className?: string }) {
  const tones = {
    info: "border-brand-200 bg-brand-50 text-brand-900",
    warn: "border-amber-200 bg-amber-50 text-amber-900",
    success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  };
  return <div className={cn("rounded-xl border px-4 py-3 text-sm", tones[tone], className)}>{children}</div>;
}

/** Renders "Your [profile]" with the bracketed words in brand blue, so each language can place them. */
export function hl(text: string) {
  return text.split(/\[(.+?)\]/).map((part, i) => (i % 2 ? <span key={i} className="text-brand-600">{part}</span> : part));
}
