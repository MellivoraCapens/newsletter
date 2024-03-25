import { Router } from "express";
import {
  createUser,
  getUser,
  getUsers,
  updateUser,
  deleteUser,
} from "../controllers/users";
import { protect, authorize } from "../middleware/auth";

const router = Router();

router.use(protect);
router.use(authorize("admin"));

router.route("/").get(getUsers).post(createUser);

router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);

export default router;
