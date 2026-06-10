import express from "express";

import { getUsers }
  from "../controllers/userController.js";

import { protect }
  from "../middleware/authMiddleware.js";

import authorizeRoles
  from "../middleware/roleMiddleware.js";

const router =
  express.Router();

router.get(
  "/",
  protect,
  authorizeRoles(
    "Manager",
    "TeamLead"
  ),
  getUsers
);

export default router;