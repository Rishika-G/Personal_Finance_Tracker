import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { spendByCategory, monthlyTrend } from "../controllers/insightController.js";

const router = Router();
router.use(requireAuth);

router.get("/by-category", spendByCategory);
router.get("/monthly-trend", monthlyTrend);

export default router;
