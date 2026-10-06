import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { scheduleEnrichmentJob, runEnrichmentPass } from "./jobs/enrichmentJob.js";

import authRoutes from "./routes/authRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import insightRoutes from "./routes/insightRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/insights", insightRoutes);

// Manual trigger for the AI enrichment pass -- handy for demoing without
// waiting for the nightly cron.
app.post("/api/admin/run-enrichment", async (req, res, next) => {
  try {
    await runEnrichmentPass();
    res.json({ message: "Enrichment pass complete" });
  } catch (err) {
    next(err);
  }
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`[server] listening on port ${PORT}`));
  scheduleEnrichmentJob();
});
