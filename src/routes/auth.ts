import { Router } from "express";
import {
  login,
  register,
  getMe,
  resetPassword,
  updatePassword,
  updateDetails,
} from "../controllers/auth";
import { protect } from "../middleware/auth";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.get("/me", protect, getMe);
router.put("/resetpassword/:resettoken", resetPassword);
router.put("/updatedetails", protect, updateDetails);
router.put("/updatepassword", protect, updatePassword);

export default router;
