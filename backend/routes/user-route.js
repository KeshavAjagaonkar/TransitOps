
import { Router } from "express";

import { authMiddleware, requireClerkAuth, requireRole } from "../middleware/auth.middleware.js";

import { getMe, syncUser, listUsers, updateUserRole } from "../controllers/user.controller.js";

const userRouter = Router();

// /sync runs BEFORE a DB user exists — only needs Clerk-level auth.
userRouter.post("/sync", requireClerkAuth, syncUser);

// Everything below requires a fully onboarded (DB row exists) user.
userRouter.get("/me", authMiddleware, getMe);
userRouter.get("/", authMiddleware, requireRole("FleetManager"), listUsers);
userRouter.patch("/:id/role", authMiddleware, requireRole("FleetManager"), updateUserRole);

export default userRouter;