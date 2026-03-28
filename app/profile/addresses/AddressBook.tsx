"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Check, X, Star } from "lucide-react";
import TurkiyeAddressSelect from "@/components/shared/TurkiyeAddressSelect";

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
  district: string; city: string; neighbourhood: string;
  postalCode: string; country: string; isDefault: boolean;
};

const empty: FormState = {
  title: "", fullName: "", phone: "0 (5", street: "",
  district: "", city: "", neighbourhood: "",
  postalCode: "", country: "Türkiye", isDefault: false,
};

export default function AddressBook({ initialAddresses }: { initialAddresses: Address[] }) {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [form, setForm] = useState<FormState>(empty);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  function parseAddress(fullStreet: string) {
    const match = fullStreet.match(/^(.*?)\s+Mah\.?\s*,?\s*(.*)$/i) || 
                  fullStreet.match(/^(.*?)\s+Mahallesi\s*,?\s*(.*)$/i);
    
    if (match) return { neighbourhood: match[1], street: match[2] };
    return { neighbourhood: "", street: fullStreet };
  }

  function startEdit(a: Address) {
    const parsed = parseAddress(a.street);
    setForm({
      title: a.title,
      fullName: a.fullName,
      phone: a.phone ? a.phone : "0 (5",
      street: parsed.street,
      district: a.district ?? "",
      city: a.city,
      neighbourhood: parsed.neighbourhood,
      postalCode: a.postalCode ?? "",
      country: a.country,
      isDefault: a.isDefault,
    });
    setEditId(a.id);
    setShowForm(true);
  }

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    let input = e.target.value.replace(/\D/g, "");
    
    if (input.length < 2) {
      input = "05";
    } else if (!input.startsWith("05")) {
      if (input.startsWith("5")) {
        input = "0" + input;
      } else {
        input = "05";
      }
    }
    
    if (input.length > 11) input = input.slice(0, 11);

    let formatted = input;
    if (input.length > 1) formatted = input.slice(0, 1) + " (" + input.slice(1, 4);
    if (input.length > 4) formatted = formatted + ") " + input.slice(4, 7);
    if (input.length > 7) formatted = formatted + " " + input.slice(7, 9);
    if (input.length > 9) formatted = formatted + " " + input.slice(9, 11);
    
    setForm(f => ({ ...f, phone: formatted }));
  }

  function cancel() { setForm(empty); setEditId(null); setShowForm(false); }

  async function submit() {
    setLoading(true);
    // Mahalle adında zaten "Mah" geçiyorsa çift ekleme yapma
    let neighbourhood = form.neighbourhood;
    if (neighbourhood && !neighbourhood.toLowerCase().includes("mah")) {
      neighbourhood = `${neighbourhood} Mah.`;
    }
    const streetFull = neighbourhood 
      ? `${neighbourhood}, ${form.street}`.replace(/, $/, "").trim()
      : form.street;

    const body = {
      ...form,
      street: streetFull,
      phone: form.phone || undefined,
      district: form.district || undefined,
      postalCode: form.postalCode || undefined,
    };

    if (editId) {
      const res = await fetch(`/api/user/addresses/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.data) {
        setAddresses((prev) =>
          prev.map((a) => a.id === editId ? json.data : (json.data.isDefault ? { ...a, isDefault: false } : a))
        );
      }
    } else {
      const res = await fetch("/api/user/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
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
    const res = await fetch(`/api/user/addresses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDefault: true }),
    });
    const json = await res.json();
    if (json.data) setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
  }

  const inputCls =
    "w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 dark:focus:border-indigo-500 transition-all text-zinc-900 dark:text-zinc-50";

  const labelCls = "block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1.5";

  return (
    <div className="space-y-4">
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
        >
          <Plus className="h-4 w-4" /> Yeni Adres Ekle
        </button>
      )}

      {showForm && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4">
          <h2 className="font-bold text-sm text-zinc-900 dark:text-zinc-50 border-b border-zinc-100 dark:border-zinc-800 pb-3">
            {editId ? "Adresi Düzenle" : "Yeni Adres Ekle"}
          </h2>

          {/* Başlık + Ad Soyad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Adres Başlığı *</label>
              <input
                value={form.title}
                onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Ev, İş…"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Ad Soyad *</label>
              <input
                value={form.fullName}
                onChange={(e) => setForm(f => ({ ...f, fullName: e.target.value }))}
                className={inputCls}
              />
            </div>
          </div>

          {/* Türkiye Kademeli Adres Seçici */}
          <TurkiyeAddressSelect
            value={{ city: form.city, district: form.district, neighbourhood: form.neighbourhood }}
            onChange={(v) => setForm(f => ({ ...f, city: v.city, district: v.district, neighbourhood: v.neighbourhood }))}
            inputClassName={inputCls}
            labelClassName={labelCls}
            required
          />

          {/* Açık Adres */}
          <div>
            <label className={labelCls}>Açık Adres (Cadde, Sokak, No...) *</label>
            <textarea
              rows={2}
              value={form.street}
              onChange={(e) => setForm(f => ({ ...f, street: e.target.value }))}
              className={`${inputCls} resize-none`}
              placeholder="Cadde, sokak, bina no, daire no..."
            />
          </div>

          {/* Posta Kodu + Telefon */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Posta Kodu</label>
              <input
                value={form.postalCode}
                onChange={(e) => setForm(f => ({ ...f, postalCode: e.target.value }))}
                placeholder="34000"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Telefon</label>
              <input
                value={form.phone}
                onChange={handlePhoneChange}
                placeholder="05xx xxx xx xx"
                className={inputCls}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm(f => ({ ...f, isDefault: e.target.checked }))}
              className="rounded"
            />
            Varsayılan adres olarak ayarla
          </label>

          <div className="flex gap-2 pt-1">
            <button
              onClick={submit}
              disabled={loading || !form.title || !form.fullName || !form.street || !form.city || !form.district}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              <Check className="h-3.5 w-3.5" /> {editId ? "Güncelle" : "Adresi Kaydet"}
            </button>
            <button
              onClick={cancel}
              className="flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm px-4 py-2.5 rounded-xl transition-colors"
            >
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
          <div
            key={a.id}
            className={`bg-white dark:bg-zinc-900 border rounded-2xl p-4 relative ${
              a.isDefault ? "border-indigo-300 dark:border-indigo-700" : "border-zinc-200 dark:border-zinc-800"
            }`}
          >
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
              <button
                onClick={() => startEdit(a)}
                className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => remove(a.id)}
                className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              {!a.isDefault && (
                <button
                  onClick={() => setDefault(a.id)}
                  className="ml-auto text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                >
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
