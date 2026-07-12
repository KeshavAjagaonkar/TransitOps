import { clerkClient } from "@clerk/express";
import { prisma } from "../lib/prisma.js";

/**
 * getExistingUser
 * Used by authMiddleware on every normal protected route.
 * Does NOT create anything — if no row exists, the caller hasn't
 * onboarded yet, and that's the signal to reject with 403.
 */
export async function getExistingUser(userId) {
  return prisma.user.findUnique({ where: { id: userId } });
}

/**
 * createUserFromOnboarding
 * Called ONCE, from POST /api/user/sync, when the onboarding form submits.
 * This is the ONLY place a User row is ever created — role is required
 * up front, so the schema can keep `role Role` (non-nullable).
 * Also mirrors the role into Clerk publicMetadata for fast frontend reads.
 */
export async function createUserFromOnboarding(userId, { role, name }) {
  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (existing) {
    throw { status: 400, message: "User has already completed onboarding" };
  }

  const clerkUser = await clerkClient.users.getUser(userId);

  const user = await prisma.user.create({
    data: {
      id: userId,
      email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
      name: name || `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim(),
      imageUrl: clerkUser.imageUrl ?? null,
      role, // required — no null state ever exists in the DB
    },
  });

  await clerkClient.users.updateUserMetadata(userId, {
    publicMetadata: { role },
  });

  return user;
}

/**
 * updateUserRole
 * FleetManager reassigning someone's role later (post-onboarding).
 */
export async function updateUserRole(userId, role) {
  const updated = await prisma.user.update({ where: { id: userId }, data: { role } });
  await clerkClient.users.updateUserMetadata(userId, { publicMetadata: { role } });
  return updated;
}