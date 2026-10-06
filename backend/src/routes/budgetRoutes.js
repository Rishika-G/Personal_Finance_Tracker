import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { upsertBudget, listBudgets, deleteBudget } from "../controllers/budgetController.js";

const router = Router();
router.use(requireAuth);

router.post("/", upsertBudget);
router.get("/", listBudgets);
router.delete("/:id", deleteBudget);

export default router;
