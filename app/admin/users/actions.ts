"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getAuthUser } from "@/lib/auth";

export async function updateUserRole(userId: number, newRole: "admin" | "user") {
  const admin = await getAuthUser();
  if (!admin || admin.role !== "admin") throw new Error("Yetkisiz");
  await db.update(users).set({ role: newRole, updatedAt: new Date() }).where(eq(users.id, userId));
  revalidatePath("/admin/users");
}
