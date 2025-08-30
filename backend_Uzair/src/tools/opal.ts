import data from "../data/opal_checklist.json";

export function opalChecklist() {
  return {
    steps: data.steps,
    docs: data.docs,
    links: data.links,
    why: data.why
  };
}
