"use client";

import { Languages } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/format";
import { LANGS, useLang, useLangStore } from "@/lib/i18n";

/** Loads the saved language once on the client and keeps <html lang> in sync. */
export function LangSync() {
  const lang = useLang();
  useEffect(() => {
    useLangStore.persist.rehydrate();
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return null;
}

/** EN / ไทย toggle. */
export function LanguageSwitch({ className }: { className?: string }) {
  const lang = useLang();
  const setLang = useLangStore((s) => s.setLang);
  return (
    <div
      role="group"
      aria-label="Language / ภาษา"
      className={cn("inline-flex h-10 items-center gap-0.5 rounded-full bg-white p-1 text-xs font-semibold ring-1 ring-line", className)}
    >
      <Languages className="mx-1 hidden size-4 text-brand-700 sm:block" aria-hidden />
      {LANGS.map((l) => (
        <button
          key={l.value}
          type="button"
          lang={l.value}
          title={l.label}
          aria-pressed={lang === l.value}
          onClick={() => setLang(l.value)}
          className={cn("h-8 rounded-full px-2.5 transition", lang === l.value ? "bg-brand-600 text-white" : "text-muted hover:text-brand-700")}
        >
          {l.short}
        </button>
      ))}
    </div>
  );
}
