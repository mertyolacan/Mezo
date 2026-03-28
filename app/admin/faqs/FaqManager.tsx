"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";

type Faq = {
  id: number;
  question: string;
  answer: string;
  category: string | null;
  sortOrder: number;
  isActive: boolean;
};

type FormState = { question: string; answer: string; category: string; sortOrder: number; isActive: boolean };
const empty: FormState = { question: "", answer: "", category: "", sortOrder: 0, isActive: true };

export default function FaqManager({ initialFaqs }: { initialFaqs: Faq[] }) {
  const router = useRouter();
  const [faqs, setFaqs] = useState(initialFaqs);
  const [form, setForm] = useState<FormState>(empty);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  function startEdit(faq: Faq) {
    setForm({ question: faq.question, answer: faq.answer, category: faq.category ?? "", sortOrder: faq.sortOrder, isActive: faq.isActive });
    setEditId(faq.id);
    setShowForm(true);
  }

  function cancel() {
    setForm(empty);
    setEditId(null);
    setShowForm(false);
  }

  async function submit() {
    setLoading(true);
    const body = { ...form, category: form.category || undefined };
    if (editId) {
      const res = await fetch(`/api/faqs/${editId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (json.data) setFaqs((prev) => prev.map((f) => (f.id === editId ? json.data : f)));
    } else {
      const res = await fetch("/api/faqs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (json.data) setFaqs((prev) => [...prev, json.data]);
    }
    cancel();
    setLoading(false);
  }

  async function remove(id: number) {
    if (!confirm("Bu SSS kaydını silmek istediğinizden emin misiniz?")) return;
    await fetch(`/api/faqs/${id}`, { method: "DELETE" });
    setFaqs((prev) => prev.filter((f) => f.id !== id));
  }

  return (
    <div className="space-y-4">
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary-light text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" /> Yeni SSS Ekle
        </button>
      )}

      {showForm && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-50 text-sm">{editId ? "SSS Düzenle" : "Yeni SSS"}</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Soru *</label>
              <input
                value={form.question}
                onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
                className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Cevap *</label>
              <textarea
                rows={4}
                value={form.answer}
                onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))}
                className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Kategori</label>
                <input
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  placeholder="ör. Ürünler, Ödeme…"
                  className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Sıra</label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} className="rounded" />
              Aktif
            </label>
          </div>
          <div className="flex gap-2">
            <button onClick={submit} disabled={loading || !form.question || !form.answer} className="flex items-center gap-1.5 bg-brand-primary hover:bg-brand-primary-light disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
              <Check className="h-3.5 w-3.5" /> {editId ? "Güncelle" : "Kaydet"}
            </button>
            <button onClick={cancel} className="flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm px-4 py-2 rounded-lg transition-colors">
              <X className="h-3.5 w-3.5" /> İptal
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {faqs.length === 0 && (
          <p className="text-sm text-zinc-400 text-center py-8">Henüz SSS eklenmemiş</p>
        )}
        {faqs.map((faq) => (
          <div key={faq.id} className={`bg-white dark:bg-zinc-900 border rounded-xl p-4 ${faq.isActive ? "border-zinc-200 dark:border-zinc-800" : "border-dashed border-zinc-300 dark:border-zinc-700 opacity-60"}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {faq.category && (
                    <span className="text-xs bg-brand-primary/5 dark:bg-brand-primary/10/30 text-brand-primary dark:text-brand-primary px-2 py-0.5 rounded-full">{faq.category}</span>
                  )}
                  {!faq.isActive && <span className="text-xs text-zinc-400">Pasif</span>}
                </div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{faq.question}</p>
                <p className="text-sm text-zinc-500 mt-1 line-clamp-2">{faq.answer}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => startEdit(faq)} className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => remove(faq.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
