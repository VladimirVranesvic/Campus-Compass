// src/tools/transport.ts
// Reads src/data/commute_samples.json if present; otherwise returns a friendly default.

import fs from "fs";
import path from "path";

type CommuteProfile = {
  postcode?: string | number;
  campusKey?: string;           // e.g. "USYD_CAMPERDOWN"
};

export function commuteSummary(p: CommuteProfile) {
  try {
    const file = path.resolve(__dirname, "../data/commute_samples.json");
    const raw = JSON.parse(fs.readFileSync(file, "utf8"));

    // very loose example reader – shape your JSON how you like
    const key = `${p.campusKey ?? "DEFAULT"}::${p.postcode ?? ""}`;
    const sample = raw[key] ?? raw["DEFAULT"];

    if (sample) return sample;
  } catch {
    // ignore; fall through to default
  }

  return {
    arrival_window: "07:30–08:30",
    step_free_available: true,
    typical_minutes: 42,
  };
}

