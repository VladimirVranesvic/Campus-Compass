import dayjs from "dayjs";
import data from "../data/uac_key_dates.json";
import { PlanItem } from "../lib/types";

export function getUpcomingDates(): PlanItem[] {
  const now = dayjs();
  const upcoming = data.milestones
    .map(m => ({
      id: m.id,
      title: m.title,
      due: dayjs(m.date).toISOString(),
      steps: ["Set up your UAC account", "Prepare ID and results"],
      why: m.why
    }))
    .filter(m => dayjs(m.due).isAfter(now))
    .sort((a, b) => +new Date(a.due) - +new Date(b.due));

  return upcoming.slice(0, 3); // next 3
}
