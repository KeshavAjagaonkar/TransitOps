
import { clerkClient } from "@clerk/express";
import { prisma } from "../lib/prisma.js";


export async function findOrCreateUser(userId) {
  let user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (user) return user;

  const clerkUser = await clerkClient.users.getUser(userId);

  return prisma.user.create({
    data: {
      id: userId,
      email: clerkUser.emailAddresses[0]?.emailAddress,
      name: `${clerkUser.firstName ?? ""} ${
        clerkUser.lastName ?? ""
      }`.trim(),
      imageUrl: clerkUser.imageUrl,
    },
  });
}