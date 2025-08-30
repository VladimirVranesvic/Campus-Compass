import { z } from "zod";

export const profileSchema = z.object({
  postcode: z.string().min(3),
  campusKey: z.string().min(2),
  nearbyPostcodes: z.array(z.string()).optional(),
  dwelling: z.enum(["studio","1-bed","2-bed","share"]).optional(),
  age: z.number().int().positive().optional(),
  study_load: z.enum(["full_time","part_time"]).optional(),
  weekly_income: z.number().nonnegative().optional(),
  regional_move_km: z.number().nonnegative().optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;
