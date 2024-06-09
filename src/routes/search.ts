import { Router } from "express";
import {
  postSearch,
  userSearch,
  userAutoComplete,
} from "../controllers/search";
import { protect } from "../middleware/auth";

const router = Router();

router.post("/user", protect, userSearch);
router.post("/post", protect, postSearch);
router.post("/user/auto", protect, userAutoComplete);

export default router;
