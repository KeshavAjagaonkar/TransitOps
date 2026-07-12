import { syncUserFromClerk, updateUserRole as updateUserRoleService } from "../services/userSync.js";

import { prisma } from "../lib/prisma.js";

const VALID_ROLES = ["FleetManager", "Dispatcher", "SafetyOfficer", "FinancialAnalyst"];

// GET /api/user/me
// Only reachable after onboarding (authMiddleware requires a DB row to exist).
// Frontend doesn't need this to DECIDE about onboarding — it reads
// user.publicMetadata.role from Clerk client-side for that. This is for
// getting the full profile once inside the app.
export async function getMe(req, res, next) {
  try {
    res.json(req.user);
  } catch (err) {
    next(err);
  }
}

// POST /api/user/sync
// Runs behind requireClerkAuth (NOT authMiddleware) since the DB row
// doesn't exist yet at this point. This is the only place a User is created.
// Body: { role: "FleetManager" | "Dispatcher" | "SafetyOfficer" | "FinancialAnalyst", name?: string }
export async function syncUser(req, res, next) {
  try {
    const { role, name } = req.body;

    if (role && !VALID_ROLES.includes(role)) {
      return res.status(400).json({ error: `role must be one of [${VALID_ROLES.join(", ")}]` });
    }

    const { user, created } = await syncUserFromClerk(req.clerkUserId, { role, name });
    res.status(created ? 201 : 200).json(user);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

// GET /api/user  (FleetManager only — user management / role admin panel)
export async function listUsers(req, res, next) {
  try {
    const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
    res.json(users);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/user/:id/role  (FleetManager reassigning someone's role later)
export async function updateUserRole(req, res, next) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !VALID_ROLES.includes(role)) {
      return res.status(400).json({ error: `role must be one of [${VALID_ROLES.join(", ")}]` });
    }

    const updated = await updateUserRoleService(id, role);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}