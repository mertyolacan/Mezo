"use client";

import { useState, useTransition } from "react";
import { updateUserRole } from "./actions";

export default function ToggleUserRoleButton({ userId, role }: { userId: number; role: "admin" | "user" }) {
  const [current, setCurrent] = useState(role);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next: "admin" | "user" = current === "admin" ? "user" : "admin";
    setCurrent(next);
    startTransition(() => updateUserRole(userId, next));
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      title={`Rolü değiştir: ${current === "admin" ? "Müşteri yap" : "Admin yap"}`}
      className={`text-xs px-2 py-0.5 rounded-full font-medium transition-all cursor-pointer disabled:opacity-60 ${
        current === "admin"
          ? "bg-brand-primary/10 dark:bg-brand-primary/10/30 text-brand-primary dark:text-brand-primary hover:bg-indigo-200 dark:hover:bg-brand-primary/20"
          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-brand-primary/5 hover:text-brand-primary dark:hover:bg-brand-primary/20 dark:hover:text-brand-primary"
      }`}
    >
      {current === "admin" ? "Admin" : "Müşteri"}
    </button>
  );
}
