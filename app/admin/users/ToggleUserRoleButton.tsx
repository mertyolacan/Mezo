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
          ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900"
          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950 dark:hover:text-indigo-400"
      }`}
    >
      {current === "admin" ? "Admin" : "Müşteri"}
    </button>
  );
}
