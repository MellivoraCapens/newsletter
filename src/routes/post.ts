import { NextFunction, Router } from "express";
import {
  createPost,
  getPost,
  deletePost,
  getPostsByTag,
  handleVotes,
  getPostsByDate,
  getUsersPosts,
  getOneUsersPosts,
} from "../controllers/post";
import { protect } from "../middleware/auth";
import multer from "multer";

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/", protect, getPostsByDate);
router.post("/me", protect, getUsersPosts);
router.post("/user/:id", protect, getOneUsersPosts);
router.get("/get/:id", getPost);
router.get("/:tag", getPostsByTag);
router.post("/createpost", protect, upload.single("image"), createPost);
router.put("/vote/:id", protect, handleVotes);
router.delete("/delete/:id", protect, deletePost);

export default router;
