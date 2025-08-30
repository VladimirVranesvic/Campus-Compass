#!/usr/bin/env bash
set -euo pipefail

# Prereqs: Node 18+, pnpm or npm. If pnpm isn't installed, we'll use npm.
APP_DIR="app"
APP_NAME="campus-compass"

if [ -d "$APP_DIR" ]; then
  echo "Directory '$APP_DIR' already exists. Skipping Next.js scaffold."
else
  if command -v pnpm >/dev/null 2>&1; then
    pnpm dlx create-next-app@latest "$APP_DIR" --ts --eslint --src-dir=false --tailwind --app --no-experimental-app
  else
    npx create-next-app@latest "$APP_DIR" --ts --eslint --src-dir=false --tailwind --app --no-experimental-app
  fi
fi

cd "$APP_DIR"

# Install deps (if pnpm present, prefer it)
if command -v pnpm >/dev/null 2>&1; then
  PKG="pnpm"
else
  PKG="npm"
fi

# Ensure app dir structure
mkdir -p app/api/tools
mkdir -p components lib

# Write basic pages
cat > app/page.tsx << 'EOF'
export default function Home() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-3xl font-bold">Campus Compass</h1>
      <p className="mt-2">Your AI co‑pilot for starting uni in Australia.</p>
      <a href="/onboarding" className="mt-6 inline-block rounded-xl bg-black px-4 py-2 text-white">Get My Plan</a>
    </main>
  );
}
EOF

cat > app/onboarding/page.tsx << 'EOF'
"use client";
import { useState } from "react";

export default function Onboarding() {
  const [profile, setProfile] = useState({ postcode: "", campus: "", hours: "", residency: "domestic", age: "", incomeBand: "", needsSupport: false });
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<any>(null);

  const submit = async () => {
    setLoading(true);
    const res = await fetch("/api/agent", { method: "POST", body: JSON.stringify(profile) });
    const data = await res.json();
    setPlan(data);
    setLoading(false);
  };

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Tell us about you</h1>
      <div className="grid gap-3">
        <input className="rounded border p-2" placeholder="Postcode" onChange={e=>setProfile({...profile, postcode:e.target.value})}/>
        <input className="rounded border p-2" placeholder="Campus (e.g., USYD Camperdown)" onChange={e=>setProfile({...profile, campus:e.target.value})}/>
        <input className="rounded border p-2" placeholder="Work hours per week" onChange={e=>setProfile({...profile, hours:e.target.value})}/>
        <select className="rounded border p-2" onChange={e=>setProfile({...profile, residency:e.target.value})}>
          <option value="domestic">Domestic</option>
          <option value="international">International</option>
        </select>
        <input className="rounded border p-2" placeholder="Age" onChange={e=>setProfile({...profile, age:e.target.value})}/>
        <input className="rounded border p-2" placeholder="Income band (weekly)" onChange={e=>setProfile({...profile, incomeBand:e.target.value})}/>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" onChange={e=>setProfile({...profile, needsSupport:e.target.checked})}/>
          <span>Accessibility support needed</span>
        </label>
      </div>
      <button onClick={submit} className="rounded bg-black px-4 py-2 text-white">{loading ? "Generating..." : "Generate my plan"}</button>

      {plan && (
        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold">Your 4‑week action plan</h2>
          {plan.items?.map((item:any)=> (
            <div key={item.id} className="rounded-xl border p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{item.title}</h3>
                <span className="text-sm opacity-70">{item.due ? `Due: ${item.due}` : ""}</span>
              </div>
              <ul className="mt-2 list-disc pl-6">
                {item.steps?.map((s:string, i:number)=> <li key={i}>{s}</li>)}
              </ul>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
EOF

# Agent endpoint
cat > app/api/agent/route.ts << 'EOF'
import { NextRequest, NextResponse } from "next/server";
import { buildPlan } from "@/lib/plan";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const profile = body ? JSON.parse(body) : {};
  const plan = await buildPlan(profile);
  return NextResponse.json(plan);
}
EOF

# Tool stubs
cat > app/api/tools/dates.ts << 'EOF'
import uac from "@/data/uac_key_dates.json";

export async function getKeyDates(profile:any){
  const next = uac.milestones[0];
  return {
    nextAction: {
      id: "uac",
      title: "Check upcoming UAC date",
      due: next?.due || null,
      steps: ["Open UAC account", "Note deadline", "Prepare required documents"],
      links: [{label:"UAC", href:"https://www.uac.edu.au/"}],
      why: "UAC controls application timelines."
    },
    thisWeek: new Date().toISOString().slice(0,10),
    week2: new Date(Date.now()+ 14*864e5).toISOString().slice(0,10)
  }
}
EOF

cat > app/api/tools/benefits.ts << 'EOF'
import rules from "@/data/benefits_rules.json";

export async function evaluateBenefits(profile:any){
  const likely = Number(profile?.incomeBand||0) <= (rules.youth_allowance.income_threshold_weekly || 588);
  return {
    steps: ["Check eligibility criteria", "Gather listed documents", "Start claim on Services Australia"],
    why: likely ? "Your stated income band is under the weekly threshold." : "Income band appears above threshold; other paths may apply.",
    links: [{label:"Services Australia — Youth Allowance", href:"https://www.servicesaustralia.gov.au/youth-allowance"}]
  }
}
EOF

cat > app/api/tools/transport.ts << 'EOF'
import samples from "@/data/commute_samples.json";

export async function commuteSummary(profile:any){
  const row = samples.find(s => s.to_campus===profile?.campus) || samples[0];
  return { campus: row?.to_campus, am_peak_minutes: row?.am_peak_minutes, step_free: row?.step_free };
}
EOF

cat > app/api/tools/rent.ts << 'EOF'
import medians from "@/data/rent_medians.json";

export async function rentMedians(profile:any){
  return medians;
}
EOF

cat > app/api/tools/opal.ts << 'EOF'
export async function opalChecklist(profile:any){
  return {
    steps: ["Obtain proof of enrolment", "Apply online for Opal concession", "Verify identity", "Receive and activate card"],
    links: [{label:"Opal Concession", href:"https://www.opal.com.au/"}],
    why: "Student concessions reduce travel costs significantly."
  }
}
EOF

cat > app/api/tools/help.ts << 'EOF'
export async function helpSummary(profile:any){
  return {
    steps: ["Read HELP overview", "Check repayment thresholds", "Confirm your provider has your TFN"],
    links: [{label:"StudyAssist — HELP", href:"https://www.studyassist.gov.au/help-loans"}],
    why: "HELP defers tuition with income-contingent repayments."
  }
}
EOF

# lib/plan.ts
cat > lib/plan.ts << 'EOF'
import { getKeyDates } from "@/app/api/tools/dates";
import { evaluateBenefits } from "@/app/api/tools/benefits";
import { commuteSummary } from "@/app/api/tools/transport";
import { rentMedians } from "@/app/api/tools/rent";
import { opalChecklist } from "@/app/api/tools/opal";
import { helpSummary } from "@/app/api/tools/help";

export async function buildPlan(profile:any){
  const [dates, benefits, commute, rent, opal, help] = await Promise.all([
    getKeyDates(profile),
    evaluateBenefits(profile),
    commuteSummary(profile),
    rentMedians(profile),
    opalChecklist(profile),
    helpSummary(profile)
  ]);

  return {
    items: [
      dates.nextAction,
      { id:"help", title:"Understand HELP/HECS", due: dates.thisWeek, steps: help.steps, why: help.why, links: help.links },
      { id:"opal", title:"Apply for Opal concession", due: dates.thisWeek, steps: opal.steps, links: opal.links, why: opal.why },
      { id:"benefits", title:"Check Youth Allowance eligibility", due: dates.week2, steps: benefits.steps, why: benefits.why, links: benefits.links }
    ],
    commute, rent, benefits
  };
}
EOF

# tsconfig path alias
# append a base tsconfig change instructing "@/"" to resolve from root (will already work in Next.js defaults)

# Install types (optional step)
$PKG install

echo "✅ Bootstrap complete. Next steps:
cd $(pwd)
$PKG dev
"
