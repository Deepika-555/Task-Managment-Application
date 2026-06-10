import express from "express";

import {
  register,
  login,
  getRegisterHelpers,
} from "../controllers/authController.js";

const router =
  express.Router();

router.post(
  "/register",
  register
);

router.post(
  "/login",
  login
);

router.get(
  "/register-helpers",
  getRegisterHelpers
);

export default router;