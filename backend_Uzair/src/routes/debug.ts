import { Router } from "express";
const router = Router();

router.get("/ics", (req, res) => {
  const title = (req.query.title as string) || "Campus Compass task";
  const ics = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:${Date.now()}@campuscompass
DTSTAMP:20251217T120000Z
DTSTART:20251217T120000Z
SUMMARY:${title}
END:VEVENT
END:VCALENDAR`;

  res.setHeader("Content-Type", "text/calendar; charset=utf-8");
  res.setHeader("Content-Disposition", "attachment; filename=task.ics");
  res.send(ics);
});

export default router;
