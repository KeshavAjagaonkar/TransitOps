
import { Router } from "express";

import { authMiddleware, requireClerkAuth, requireRole } from "../middleware/auth.js";

import { getMe, syncUser, listUsers, updateUserRole } from "../controllers/user-controller.js";

const userRouter = Router();

// /sync runs BEFORE a DB user exists — only needs Clerk-level auth.
userRouter.post("/sync", requireClerkAuth, syncUser);


userRouter.get("/", authMiddleware, requireRole("FleetManager"), listUsers);

userRouter.patch("/:id/role", authMiddleware, requireRole("FleetManager"), updateUserRole);

export default userRouter;