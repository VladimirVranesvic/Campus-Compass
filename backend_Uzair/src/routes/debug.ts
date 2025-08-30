// backend_Uzair/src/routes/debug.ts
import { Router } from "express";
import { rentMedians } from "../tools/rent"; // <- path is from routes/ -> tools/

const router = Router();

/**
 * 1) Quick .ics download for your demo
 *    GET /api/debug/ics?title=Apply%20for%20Opal&due=20251217T120000Z
 */
router.get("/ics", (req, res) => {
  const title = (req.query.title as string) || "Campus Compass task";
  const due = (req.query.due as string) || "20251217T120000Z"; // ISO Basic UTC
  const uid = `${Date.now()}@campuscompass`;

  const ics = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${due}
DTSTART:${due}
SUMMARY:${title}
END:VEVENT
END:VCALENDAR`;

  res.setHeader("Content-Type", "text/calendar; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="task.ics"');
  res.send(ics);
});

/**
 * 2) Rent data “smoke test”
 *    GET /api/debug/rent-test?pc=2050&near=2050,2042,2008&dwelling=1-bed
 */
router.get("/rent-test", (req, res) => {
  const pc = String(req.query.pc ?? "2050");
  const near = String(req.query.near ?? "2050,2042,2008")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
  const dwelling = String(req.query.dwelling ?? "1-bed");

  const result = rentMedians({ postcode: pc, nearbyPostcodes: near, dwelling });
  res.json(result);
});

export default router;
