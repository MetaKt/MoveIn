"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useStore } from "@/lib/store";

/** True once the persisted demo store has loaded from browser storage. */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const done = () => setHydrated(true);
    if (useStore.persist.hasHydrated()) done();
    return useStore.persist.onFinishHydration(done);
  }, []);
  return hydrated;
}

export function Hydrated({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return useHydrated() ? <>{children}</> : <>{fallback ?? <PageSkeleton />}</>;
}

export function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-6" aria-busy>
      <div className="h-6 w-40 rounded bg-brand-100" />
      <div className="h-9 w-72 rounded bg-brand-100" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-48 rounded-2xl bg-white" />
        <div className="h-48 rounded-2xl bg-white" />
      </div>
    </div>
  );
}
