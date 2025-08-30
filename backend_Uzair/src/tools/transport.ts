import samples from "../data/commute_samples.json";
import { CommuteSummary, Profile } from "../lib/types";

export function commuteSummary(p: Profile): CommuteSummary {
  const row = samples.find(
    r => r.campusKey === p.campusKey && r.from_postcode === p.postcode
  );
  if (row) {
    return {
      arrival_window: row.arrival_window,
      typical_minutes: row.typical_minutes,
      step_free_available: row.step_free_available
    };
  }
  // Fallback if we have no sample
  return { arrival_window: "07:30-08:30", typical_minutes: 45, step_free_available: true };
}
