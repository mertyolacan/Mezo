import { db } from "@/lib/db";
import { faqs } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import FaqManager from "./FaqManager";

export const dynamic = "force-dynamic";

export default async function AdminFaqsPage() {
  const rows = await db.select().from(faqs).orderBy(asc(faqs.sortOrder), asc(faqs.createdAt));

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">SSS Yönetimi</h1>
      <FaqManager initialFaqs={rows} />
    </div>
  );
}
