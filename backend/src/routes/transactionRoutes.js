import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  createTransaction,
  listTransactions,
  updateCategory,
  deleteTransaction,
  listReviewQueue,
} from "../controllers/transactionController.js";

const router = Router();
router.use(requireAuth);

router.post("/", createTransaction);
router.get("/", listTransactions);
router.get("/review-queue", listReviewQueue);
router.patch("/:id/category", updateCategory);
router.delete("/:id", deleteTransaction);

export default router;
