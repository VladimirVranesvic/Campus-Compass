import { Router } from "express";
const router = Router();

router.post("/agent", (_req, res) => {
  res.json({
    items: [
      {
        id: "apply_open",
        title: "Start your UAC application",
        due: "2025-08-01",
        steps: ["Create a UAC account", "Prepare ID and results"],
        why: "This opens your application window."
      }
    ],
    commute: {
      arrival_window: "07:30-08:30",
      step_free_available: true,
      typical_minutes: 42
    },
    rent: [
      { postcode: "2050", dwelling_type: "1-bed", median_weekly_rent: 680 }
    ],
    benefits: [
      {
        program: "Youth Allowance (Student)",
        signal: "likely",
        reasons: ["Meets age & study load"],
        docChecklist: ["Photo ID", "TFN", "Enrolment evidence"]
      }
    ]
  });
});

export default router;
