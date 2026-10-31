import { readdirSync, readFileSync, statSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { translate } from ".";
import { TH } from "./th";

const SRC = path.resolve(__dirname, "../..");

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return full.endsWith(path.join("lib", "i18n")) ? [] : sourceFiles(full);
    return /\.tsx?$/.test(name) && !name.endsWith(".test.ts") ? [full] : [];
  });
}

/** Every literal passed to t("…") or msg("…") anywhere in src. */
function usedKeys(): { key: string; file: string }[] {
  const re = /\b(?:t|msg)\(\s*(["'`])((?:\\.|(?!\1)[^\\])*)\1/g;
  return sourceFiles(SRC).flatMap((file) =>
    [...readFileSync(file, "utf8").matchAll(re)]
      .filter((m) => !(m[1] === "`" && m[2].includes("${")))
      .map((m) => ({ key: m[2].replace(/\\(.)/g, "$1"), file: path.relative(SRC, file) })),
  );
}

describe("Thai translations", () => {
  const used = usedKeys();

  it("finds the strings marked for translation", () => {
    expect(used.length).toBeGreaterThan(300);
  });

  it("has a Thai entry for every string in the app", () => {
    const missing = [...new Set(used.filter((u) => !(u.key in TH)).map((u) => `${u.file}: ${u.key}`))];
    expect(missing).toEqual([]);
  });

  it("keeps every {placeholder} in the Thai text", () => {
    const broken = Object.entries(TH).filter(([en, th]) => {
      const vars = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join();
      return vars(en) !== vars(th);
    });
    expect(broken).toEqual([]);
  });

  it("fills placeholders and falls back to English", () => {
    expect(translate("en", "Hello {name}", { name: "Nuhr" })).toBe("Hello Nuhr");
    expect(translate("th", "No translation for this one")).toBe("No translation for this one");
  });
});
