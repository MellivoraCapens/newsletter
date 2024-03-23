"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_1 = require("../controllers/users");
const router = (0, express_1.Router)();
router.route("/").get(users_1.getUsers).post(users_1.createUser);
router.route("/:id").get(users_1.getUser).put(users_1.updateUser).delete(users_1.deleteUser);
exports.default = router;
