// backend_Uzair/src/routes/agent.ts
import { Router } from "express";

// tools your route uses
import { firstDue } from "../tools/dates";
import { help } from "../tools/help";
import { opal } from "../tools/opal";
import { rentMedians } from "../tools/rent";
import { evaluateBenefits } from "../tools/benefits";
// import { commuteSummary } from "../tools/transport"; // optional

const router = Router();

router.post("/agent", (req, res) => {
  const profile = req.body ?? {};

  // compute data from your tools
  const rent = rentMedians(profile);
  const benefits = evaluateBenefits(profile);
  // const commute = commuteSummary(profile); // optional

  // the action-plan items your frontend expects
  const items = [
    {
      id: "help",
      title: "Understand HELP/HECS",
      due: firstDue,
      steps: help.steps,
      why: help.why,
      links: help.links,
    },
    {
      id: "opal",
      title: "Apply for Opal concession",
      due: firstDue,
      steps: opal.steps,
      why: opal.why,
      links: opal.links,
    },
    {
      id: "benefits",
      title: "Check Youth Allowance eligibility",
      // due: dayjs(firstDue).add(7, "day").toISOString(), // if you’re using dayjs
      due: firstDue,
      steps: ["Answer a few questions", "Gather documents", "Start claim"],
      links: benefits[0]?.links ?? [],
    },
  ];

  // send everything back
  res.json({ items, /*commute,*/ rent, benefits });
});

export default router;
