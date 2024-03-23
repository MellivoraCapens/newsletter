import { Router } from "express";
import { createComment } from "../controllers/comment";
import { protect } from "../middleware/auth";

const router = Router();

router.post("/:id", protect, createComment);

export default router;
