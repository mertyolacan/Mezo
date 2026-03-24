"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Check, X, Star } from "lucide-react";

type Address = {
  id: number;
  title: string;
  fullName: string;
  phone: string | null;
  street: string;
  district: string | null;
  city: string;
  postalCode: string | null;
  country: string;
  isDefault: boolean;
};

type FormState = {
  title: string; fullName: string; phone: string; street: string;
  district: string; city: string; postalCode: string; country: string; isDefault: boolean;
};
const empty: FormState = { title: "", fullName: "", phone: "", street: "", district: "", city: "", postalCode: "", country: "Türkiye", isDefault: false };

export default function AddressBook({ initialAddresses }: { initialAddresses: Address[] }) {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [form, setForm] = useState<FormState>(empty);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  function startEdit(a: Address) {
    setForm({ title: a.title, fullName: a.fullName, phone: a.phone ?? "", street: a.street, district: a.district ?? "", city: a.city, postalCode: a.postalCode ?? "", country: a.country, isDefault: a.isDefault });
    setEditId(a.id);
    setShowForm(true);
  }

  function cancel() { setForm(empty); setEditId(null); setShowForm(false); }

  function field(key: keyof FormState, value: string | boolean) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit() {
    setLoading(true);
    const body = { ...form, phone: form.phone || undefined, district: form.district || undefined, postalCode: form.postalCode || undefined };
    if (editId) {
      const res = await fetch(`/api/user/addresses/${editId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (json.data) {
        setAddresses((prev) => {
          const updated = prev.map((a) => a.id === editId ? json.data : (json.data.isDefault ? { ...a, isDefault: false } : a));
          return updated;
        });
      }
    } else {
      const res = await fetch("/api/user/addresses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (json.data) {
        setAddresses((prev) => [
          ...(json.data.isDefault ? prev.map((a) => ({ ...a, isDefault: false })) : prev),
          json.data,
        ]);
      }
    }
    cancel();
    setLoading(false);
  }

  async function remove(id: number) {
    if (!confirm("Bu adresi silmek istediğinizden emin misiniz?")) return;
    await fetch(`/api/user/addresses/${id}`, { method: "DELETE" });
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  }

  async function setDefault(id: number) {
    const res = await fetch(`/api/user/addresses/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isDefault: true }) });
    const json = await res.json();
    if (json.data) setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
  }

  const inputCls = "w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <div className="space-y-4">
      {!showForm && (
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus className="h-4 w-4" /> Yeni Adres Ekle
        </button>
      )}

      {showForm && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-sm text-zinc-900 dark:text-zinc-50">{editId ? "Adresi Düzenle" : "Yeni Adres"}</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Adres Başlığı *</label>
              <input value={form.title} onChange={(e) => field("title", e.target.value)} placeholder="Ev, İş…" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Ad Soyad *</label>
              <input value={form.fullName} onChange={(e) => field("fullName", e.target.value)} className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">Adres *</label>
            <textarea rows={2} value={form.street} onChange={(e) => field("street", e.target.value)} className={`${inputCls} resize-none`} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">İlçe</label>
              <input value={form.district} onChange={(e) => field("district", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Şehir *</label>
              <input value={form.city} onChange={(e) => field("city", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Posta Kodu</label>
              <input value={form.postalCode} onChange={(e) => field("postalCode", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Telefon</label>
              <input value={form.phone} onChange={(e) => field("phone", e.target.value)} className={inputCls} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer">
            <input type="checkbox" checked={form.isDefault} onChange={(e) => field("isDefault", e.target.checked)} className="rounded" />
            Varsayılan adres olarak ayarla
          </label>
          <div className="flex gap-2">
            <button onClick={submit} disabled={loading || !form.title || !form.fullName || !form.street || !form.city} className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
              <Check className="h-3.5 w-3.5" /> {editId ? "Güncelle" : "Kaydet"}
            </button>
            <button onClick={cancel} className="flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm px-4 py-2 rounded-lg transition-colors">
              <X className="h-3.5 w-3.5" /> İptal
            </button>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {addresses.length === 0 && !showForm && (
          <p className="text-sm text-zinc-400 col-span-2 py-8 text-center">Henüz adres eklenmemiş.</p>
        )}
        {addresses.map((a) => (
          <div key={a.id} className={`bg-white dark:bg-zinc-900 border rounded-xl p-4 relative ${a.isDefault ? "border-indigo-300 dark:border-indigo-700" : "border-zinc-200 dark:border-zinc-800"}`}>
            {a.isDefault && (
              <span className="absolute top-3 right-3 flex items-center gap-1 text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">
                <Star className="h-3 w-3 fill-current" /> Varsayılan
              </span>
            )}
            <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-50 mb-0.5">{a.title}</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{a.fullName}</p>
            <p className="text-sm text-zinc-500 mt-1">{a.street}</p>
            <p className="text-sm text-zinc-500">{[a.district, a.city, a.postalCode].filter(Boolean).join(", ")}</p>
            {a.phone && <p className="text-sm text-zinc-500">{a.phone}</p>}
            <div className="flex items-center gap-1 mt-3">
              <button onClick={() => startEdit(a)} className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">
                <Pencil className="h-4 w-4" />
              </button>
              <button onClick={() => remove(a.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
              {!a.isDefault && (
                <button onClick={() => setDefault(a.id)} className="ml-auto text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                  Varsayılan yap
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
