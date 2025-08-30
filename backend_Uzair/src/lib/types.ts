export type StudyLoad = "full_time" | "part_time";

export interface Profile {
  postcode: string;
  campusKey: string;
  nearbyPostcodes?: string[];
  dwelling?: "studio" | "1-bed" | "2-bed" | "share";
  age?: number;
  study_load?: StudyLoad;
  weekly_income?: number;
  regional_move_km?: number;
}

export interface PlanItem {
  id: string;
  title: string;
  due: string;              // ISO date
  steps: string[];
  why: string;
  links?: { label: string; href: string }[];
}

export interface CommuteSummary {
  arrival_window: string;
  typical_minutes: number;
  step_free_available: boolean;
}

export interface RentRow {
  postcode: string;
  dwelling_type: string;
  median_weekly_rent: number;
}

export interface BenefitResult {
  program: string;
  signal: "likely" | "borderline" | "unlikely";
  reasons: string[];
  docChecklist: string[];
  links?: { label: string; href: string }[];
}
