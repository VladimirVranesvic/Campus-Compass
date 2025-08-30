// src/lib/validate.ts
import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";

/** Validate req.body against a Zod schema; puts parsed data on req.valid */
export function body<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "Invalid body",
        issues: result.error.issues,
      });
    }
    (req as any).valid = result.data;
    next();
  };
}

/** Validate req.query against a Zod schema; puts parsed data on req.valid */
export function query<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({
        error: "Invalid query",
        issues: result.error.issues,
      });
    }
    (req as any).valid = result.data;
    next();
  };
}
