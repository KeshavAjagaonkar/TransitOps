import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";

const authRouter = Router();

authRouter.use(authMiddleware);

authRouter.get("/me", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ user: req.user });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/onboard", async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!role) {
      return res.status(400).json({ error: "Role is required" });
    }

    const validRoles = ["FleetManager", "Dispatcher", "SafetyOfficer", "FinancialAnalyst"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { role },
    });

    res.json({ user: updatedUser });
  } catch (error) {
    next(error);
  }
});

export default authRouter;
