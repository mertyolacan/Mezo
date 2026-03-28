"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";

export default function TicketReplyForm({ ticketId }: { ticketId: number }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setLoading(true);
    await fetch(`/api/support/${ticketId}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    setLoading(false);
    setMessage("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 rounded-card border border-zinc-200 dark:border-zinc-800 p-5 space-y-3 shadow-sm">
      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Yanıt Ekle</p>
      <textarea
        className="w-full rounded-input border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition resize-none"
        rows={3}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Mesajınız..."
        required
      />
      <button
        type="submit"
        disabled={loading || !message.trim()}
        className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary/90 active:bg-brand-primary/95 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-btn transition-colors shadow-lg shadow-brand-primary/20"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        Gönder
      </button>
    </form>
  );
}
