import { Router } from "express";
import {
  createComment,
  deleteComment,
  deleteCommentByPostAuthor,
  handleVotesForComment,
  createCommentToComment,
  getCommentByParentId,
  deleteAllComments,
} from "../controllers/comment";
import { protect } from "../middleware/auth";

const router = Router();

router.get("/get/:id", protect, getCommentByParentId);
router.post("/post/:id", protect, createComment);
router.post("/comment/:id", protect, createCommentToComment);
router.delete("/delete/:id", protect, deleteComment);
router.put("/delete/postauthor/:id", protect, deleteCommentByPostAuthor);
router.put("/vote/:id", protect, handleVotesForComment);
router.delete("/delete/post/:id", protect, deleteAllComments);

export default router;
