import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import agentRoutes from "./routes/agent";
import debugRoutes from "./routes/debug";

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api", agentRoutes); // POST /api/agent
app.use("/api", debugRoutes); // GET  /api/ics

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Campus Compass backend running on :${PORT}`));
