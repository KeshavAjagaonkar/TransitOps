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
 * syncUserFromClerk
 * Keeps the local User row aligned with Clerk and creates the row on the
 * first role-bearing onboarding submit.
 */
export async function syncUserFromClerk(userId, { role, name } = {}) {
  const clerkUser = await clerkClient.users.getUser(userId);
  const existing = await prisma.user.findUnique({ where: { id: userId } });
  const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
  const resolvedName = name || `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim();

  if (existing) {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        email,
        name: resolvedName || existing.name,
        imageUrl: clerkUser.imageUrl ?? null,
        ...(role ? { role } : {}),
      },
    });

    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: { role: role ?? updated.role },
    });

    return { user: updated, created: false };
  }

  if (!role) {
    throw { status: 409, message: "Onboarding required" };
  }

  const user = await prisma.user.create({
    data: {
      id: userId,
      email,
      name: resolvedName || email,
      imageUrl: clerkUser.imageUrl ?? null,
      role,
    },
  });

  await clerkClient.users.updateUserMetadata(userId, {
    publicMetadata: { role },
  });

  return { user, created: true };
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