// backend_Uzair/src/index.ts
import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import agentRoutes from "./routes/agent";
import debugRoutes from "./routes/debug";

const app = express();

// --- middleware ---
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// --- health check ---
app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

// --- mount feature routes ---
app.use("/api/agent", agentRoutes);
app.use("/api/debug", debugRoutes);

// --- 404 (not found) ---
app.use((req, res) => {
  res.status(404).json({ error: "Not found", path: req.path });
});

// --- error handler ---
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Server error" });
});

// --- start server ---
const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, () => {
  console.log(`API running → http://localhost:${PORT}`);
});
