import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/format";

/** One numbered step block (deck: "STEP 1 - Transfer Reservation and Deposit"). */
export function StepCard({
  n,
  title,
  state,
  children,
}: {
  n: number;
  title: string;
  state: "done" | "current" | "locked";
  children?: ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border bg-white p-5 transition",
        state === "current" ? "border-brand-400 ring-4 ring-brand-100" : "border-line",
        state === "locked" && "opacity-60",
      )}
      aria-current={state === "current" ? "step" : undefined}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold",
            state === "done" ? "bg-emerald-500 text-white" : state === "current" ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-500",
          )}
        >
          {state === "done" ? <Check className="size-4" /> : n}
        </span>
        <h2 className="text-base font-bold">
          <span className="mr-1 text-xs font-bold uppercase tracking-wider text-muted">Step {n} ·</span> {title}
        </h2>
      </div>
      {state !== "locked" && children && <div className="mt-4 space-y-4 pl-0 sm:pl-11">{children}</div>}
    </section>
  );
}

export function StatusPill({ tone, children }: { tone: "waiting" | "action" | "done" | "stopped"; children: ReactNode }) {
  const tones = {
    waiting: "bg-amber-50 text-amber-800 ring-amber-200",
    action: "bg-brand-600 text-white ring-brand-600",
    done: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    stopped: "bg-slate-100 text-slate-600 ring-slate-200",
  };
  return <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1", tones[tone])}>{children}</span>;
}
