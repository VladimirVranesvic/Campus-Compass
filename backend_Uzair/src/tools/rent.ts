// src/tools/rent.ts
// Uses the JSON your seeder created: src/data/rent_medians.json
// Returns median weekly rent rows filtered by (postcode OR nearbyPostcodes) + dwelling.

import rows from "../data/rent_medians.json";

export type RentRow = {
  postcode: string | number;
  dwelling_type: string;         // e.g. "studio" | "1-bed" | "2-bed" | "share"
  median_weekly_rent: number;
};

export type Profile = {
  postcode: string | number;
  nearbyPostcodes?: Array<string | number>;
  dwelling?: string;             // "1-bed" (default), "studio", "2-bed", "share"
};

function norm(v?: string) {
  return String(v ?? "").trim().toLowerCase();
}

export function rentMedians(profile: Profile): RentRow[] {
  const wanted = norm(profile.dwelling || "1-bed");
  const pool = [profile.postcode, ...(profile.nearbyPostcodes ?? [])].map(String);

  const list = (rows as RentRow[])
    .filter(
      (r) =>
        pool.includes(String(r.postcode)) &&
        norm(r.dwelling_type) === wanted
    )
    .sort((a, b) => a.median_weekly_rent - b.median_weekly_rent)
    .slice(0, 8);

  return list;
}
