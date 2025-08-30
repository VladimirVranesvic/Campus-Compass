// src/tools/dates.ts
import fs from "fs";
import path from "path";
import dayjs from "dayjs";

type UacDate = { label?: string; iso?: string; date?: string };

// Try to load the next UAC date from src/data/uac_key_dates.json.
// If anything fails, fall back to 7 days from now.
function computeFirstDue(): string {
  try {
    const p = path.resolve(__dirname, "../data/uac_key_dates.json");
    const raw = JSON.parse(fs.readFileSync(p, "utf8"));
    const list: UacDate[] = raw?.dates ?? raw ?? [];

    const now = dayjs();
    const upcoming = list
      .map(d => dayjs(d.iso ?? d.date))
      .filter(d => d.isValid() && d.isAfter(now))
      .sort((a, b) => a.valueOf() - b.valueOf())[0];

    return (upcoming ?? now.add(7, "day")).startOf("day").toISOString();
  } catch {
    return dayjs().add(7, "day").startOf("day").toISOString();
  }
}

// This is what agent.ts uses
export const firstDue = computeFirstDue();

// If you want more dates later, export helpers here (e.g. next change-of-preference window).
