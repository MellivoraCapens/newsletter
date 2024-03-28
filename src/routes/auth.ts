import { Router } from "express";
import {
  login,
  register,
  getMe,
  resetPassword,
  updatePassword,
  updateDetails,
  addProfilePicture,
  deleteProfilePicture,
} from "../controllers/auth";
import { protect } from "../middleware/auth";
import multer from "multer";

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/login", login);
router.post("/register", register);
router.post(
  "/profilepicture",
  upload.single("profilePicture"),
  protect,
  addProfilePicture
);
router.get("/me", protect, getMe);
router.put("/deletepicture", protect, deleteProfilePicture);
router.put("/resetpassword/:resettoken", resetPassword);
router.put("/updatedetails", protect, updateDetails);
router.put("/updatepassword", protect, updatePassword);

export default router;
