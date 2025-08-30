import rows from "../data/rent_medians.json";
import { Profile, RentRow } from "../lib/types";

export function rentMedians(p: Profile): RentRow[] {
  const wanted = p.dwelling || "1-bed";
  const pool = (p.nearbyPostcodes && p.nearbyPostcodes.length ? p.nearbyPostcodes : [p.postcode]);
  return rows
    .filter(r => pool.includes(r.postcode) && r.dwelling_type === wanted)
    .sort((a,b)=> a.median_weekly_rent - b.median_weekly_rent)
    .slice(0, 5);
}
