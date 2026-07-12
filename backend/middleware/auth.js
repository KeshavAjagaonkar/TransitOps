import { getAuth } from "@clerk/express";

import { getExistingUser } from "../services/userSync.js";

// "Are you logged into Clerk?" — Clerk-level check only, no DB lookup.
// Use this ONLY on POST /api/user/sync, since that route creates the row
// that doesn't exist yet — requiring a DB user there would be circular.
export const requireClerkAuth = (req, res, next) => {
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  req.clerkUserId = userId;
  next();
};

// "Who are you?" — Clerk auth + must already have a DB row (i.e. has
// completed onboarding). If the row doesn't exist, that IS the signal
// that onboarding hasn't happened — no auto-create, no null-role state.
// Use this on every route EXCEPT /api/user/sync.
export const authMiddleware = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await getExistingUser(userId);
    if (!user) {
      return res.status(403).json({ error: "Onboarding required", code: "ONBOARDING_REQUIRED" });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

// "Are you allowed here?" — role check.
// Usage: router.post("/vehicles", authMiddleware, requireOnboarded, requireRole("FleetManager"), createVehicle)
export const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      error: `Forbidden: requires one of [${allowedRoles.join(", ")}]`,
    });
  }
  next();
};
