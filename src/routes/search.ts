import { Router } from "express";
import { postSearch, userSearch } from "../controllers/search";

const router = Router();

router.post("/user", userSearch);
router.post("/post", postSearch);

export default router;
