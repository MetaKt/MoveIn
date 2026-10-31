import { useCallback } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { safeLocalStorage } from "../storage";
import { TH } from "./th";

/**
 * English is the source language: every UI string is written in English and
 * looked up in the Thai dictionary by that exact text. A missing Thai entry
 * falls back to English, and i18n.test.ts fails the build when one is missing.
 *
 * Use `t("Rooms near {place}", { place })` in components and `msg("…")` for
 * strings defined outside components, so the test can find both.
 */
export type Lang = "en" | "th";
export type Vars = Record<string, string | number>;

export const LANGS: { value: Lang; label: string; short: string }[] = [
  { value: "en", label: "English", short: "EN" },
  { value: "th", label: "ภาษาไทย", short: "ไทย" },
];

export const useLangStore = create<{ lang: Lang; setLang: (lang: Lang) => void }>()(
  persist((set) => ({ lang: "en", setLang: (lang) => set({ lang }) }), {
    name: "movein-lang",
    storage: createJSONStorage(() => safeLocalStorage),
    // Rehydrated by <LangSync /> after mount, so the server and first client render agree.
    skipHydration: true,
  }),
);

export function translate(lang: Lang, text: string, vars?: Vars): string {
  const base = lang === "th" ? (TH[text] ?? text) : text;
  return vars ? base.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m)) : base;
}

/** Marks a string for translation without translating it yet (for constants). */
export const msg = <T extends string>(text: T) => text;

export const getLang = () => useLangStore.getState().lang;

export const useLang = () => useLangStore((s) => s.lang);

export function useT() {
  const lang = useLang();
  return useCallback((text: string, vars?: Vars) => translate(lang, text, vars), [lang]);
}
