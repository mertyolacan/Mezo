"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AdminTicketReply({ ticketId }: { ticketId: number }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setLoading(true);

    await fetch(`/api/support/${ticketId}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    setMessage("");
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        required
        rows={4}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Admin yanıtı..."
        className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-primary transition"
      />
      <button
        type="submit"
        disabled={loading}
        className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary-light disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Yanıtla
      </button>
    </form>
  );
}
