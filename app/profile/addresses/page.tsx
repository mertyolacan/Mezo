import { db } from "@/lib/db";
import { userAddresses } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import AddressBook from "./AddressBook";

export const dynamic = "force-dynamic";

export default async function AddressesPage() {
  const user = await getAuthUser();
  if (!user) redirect("/login");

  const addresses = await db
    .select()
    .from(userAddresses)
    .where(eq(userAddresses.userId, user.id))
    .orderBy(asc(userAddresses.createdAt));

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Adres Defterim</h1>
      <AddressBook initialAddresses={addresses} />
    </div>
  );
}
