import { getAuth } from "@clerk/express";
import { findOrCreateUser } from "../services/userSync.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    req.user = await findOrCreateUser(userId);

    next();
  } catch (error) {
    next(error);
  }
};

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!req.user.role || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
    }
    next();
  };
};
