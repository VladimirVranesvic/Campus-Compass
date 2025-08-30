// src/tools/benefits.ts
// Simple rule-based Youth Allowance triage with sensible fallbacks.

import fs from "fs";
import path from "path";

type Rules = {
  youth_allowance?: {
    age_min?: number;
    study_load?: "full_time" | "part_time" | string;
    income_threshold_weekly?: number;
    independence_paths?: string[];
    docs?: string[];
  };
  relocation_scholarship?: {
    requires?: string[];
    docs?: string[];
  };
};

// Load rules from src/data/benefits_rules.json if present
function loadRules(): Rules {
  try {
    const p = path.resolve(__dirname, "../data/benefits_rules.json");
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    // Fallback defaults (safe/rough)
    return {
      youth_allowance: {
        age_min: 18,
        study_load: "full_time",
        income_threshold_weekly: 588, // rough guide value for demo
        independence_paths: [
          "worked_30_of_52_weeks",
          "regional_relocation",
          "over_22",
        ],
        docs: ["Photo ID", "TFN", "Bank statements (13 weeks)", "Enrolment evidence"],
      },
      relocation_scholarship: {
        requires: ["youth_allowance_receipt", "move_distance_over_90km"],
        docs: ["New lease/tenancy", "Previous address proof", "Enrolment evidence"],
      },
    };
  }
}

const RULES = loadRules();

export type BenefitProfile = {
  age?: number;
  study_load?: "full_time" | "part_time" | string;
  weekly_income?: number;            // student income (or parental if dependent)
  independent?: boolean;             // if user says they meet an independence test
  move_distance_km?: number;         // for relocation scholarship signal
};

export type BenefitResult = {
  program: string;
  signal: "Likely" | "Borderline" | "Unlikely";
  reasons: string[];
  docChecklist: string[];
  links: { label: string; href: string }[];
};

export function evaluateBenefits(p: BenefitProfile): BenefitResult[] {
  const out: BenefitResult[] = [];

  // --- Youth Allowance (Student) ---
  {
    const r = RULES.youth_allowance ?? {};
    const reasons: string[] = [];
    let score = 0;

    if (p.age !== undefined && r.age_min !== undefined) {
      if (p.age >= r.age_min) {
        reasons.push(`Age ≥ ${r.age_min}`);
        score += 1;
      } else {
        reasons.push(`Age < ${r.age_min}`);
      }
    }

    if (p.study_load && r.study_load) {
      if (String(p.study_load).toLowerCase() === String(r.study_load).toLowerCase()) {
        reasons.push(`Study load ${p.study_load}`);
        score += 1;
      } else {
        reasons.push(`Study load is ${p.study_load} (expected ${r.study_load})`);
      }
    }

    if (p.weekly_income !== undefined && r.income_threshold_weekly !== undefined) {
      if (p.weekly_income <= r.income_threshold_weekly) {
        reasons.push(`Income ≤ $${r.income_threshold_weekly}/wk`);
        score += 1;
      } else if (p.weekly_income <= r.income_threshold_weekly * 1.1) {
        reasons.push(`Income slightly above threshold ($${p.weekly_income}/wk)`);
        score += 0.5;
      } else {
        reasons.push(`Income above threshold ($${p.weekly_income}/wk)`);
      }
    }

    if (p.independent) {
      reasons.push("Claims independence path");
      score += 0.5;
    }

    let signal: BenefitResult["signal"] = "Unlikely";
    if (score >= 2.5) signal = "Likely";
    else if (score >= 1.5) signal = "Borderline";

    out.push({
      program: "Youth Allowance (Student)",
      signal,
      reasons,
      docChecklist: r.docs ?? ["Photo ID", "TFN", "Enrolment evidence"],
      links: [
        { label: "Services Australia — Youth Allowance", href: "https://www.servicesaustralia.gov.au/youth-allowance" },
        { label: "Start a claim (myGov)", href: "https://www.my.gov.au/" },
      ],
    });
  }

  // --- Relocation Scholarship (signal only) ---
  {
    const rs = RULES.relocation_scholarship ?? {};
    const reasons: string[] = [];
    let signal: BenefitResult["signal"] = "Unlikely";

    const distanceOK = (p.move_distance_km ?? 0) >= 90;
    if (distanceOK) reasons.push("Move distance ≥ 90km");

    // If YA was "Likely" and distance OK, nudge to "Borderline/Likely"
    const ya = out.find((o) => o.program.startsWith("Youth Allowance"));
    if (ya?.signal !== "Unlikely" && distanceOK) {
      signal = ya.signal === "Likely" ? "Likely" : "Borderline";
    } else if (distanceOK) {
      signal = "Borderline";
    }

    out.push({
      program: "Relocation Scholarship",
      signal,
      reasons: reasons.length ? reasons : ["Distance threshold not met"],
      docChecklist: rs.docs ?? ["New lease/tenancy", "Previous address proof", "Enrolment evidence"],
      links: [
        { label: "Relocation Scholarship — Services Australia", href: "https://www.servicesaustralia.gov.au/relocation-scholarship" },
      ],
    });
  }

  return out;
}
