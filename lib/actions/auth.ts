"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { signToken, setAuthCookie } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function adminLoginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    redirect("/admin-login?error=missing");
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user || !user.isActive || user.role !== "admin") {
    redirect("/admin-login?error=unauthorized");
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    redirect("/admin-login?error=invalid");
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role });
  await setAuthCookie(token);

  redirect("/admin");
}
