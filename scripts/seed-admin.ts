import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { users } from "../lib/db/schema";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function main() {
  const password = await bcrypt.hash("Admin123!", 12);

  await db
    .insert(users)
    .values({
      name: "Admin",
      email: "admin@mesopro.com",
      password,
      role: "admin",
    })
    .onConflictDoNothing();

  console.log("✅ Admin kullanıcı oluşturuldu: admin@mesopro.com / Admin123!");
  process.exit(0);
}

main();
