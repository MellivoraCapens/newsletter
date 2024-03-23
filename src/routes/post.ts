import { Router } from "express";
import {
  createPost,
  getPost,
  deletePost,
  getPostsByTag,
  handleVotes,
} from "../controllers/post";
import { protect } from "../middleware/auth";

const router = Router();

router.get("/get/:id", getPost);
router.get("/get/:tag", getPostsByTag);
router.post("/createpost", protect, createPost);
router.put("/vote/:id", protect, handleVotes);
router.delete("/delete/:id", deletePost);

export default router;
