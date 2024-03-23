import { Router } from "express";
import {
  createComment,
  deleteComment,
  deleteCommentByPostAuthor,
} from "../controllers/comment";
import { protect } from "../middleware/auth";

const router = Router();

router.post("/:id", protect, createComment);
router.delete("/delete/:id", protect, deleteComment);
router.put("/delete/postauthor/:id", protect, deleteCommentByPostAuthor);

export default router;
