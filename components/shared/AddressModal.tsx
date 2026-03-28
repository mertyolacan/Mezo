"use client";

import { useState } from "react";
import { X, Plus, Pencil, Check, Loader2, MapPin, Phone, User, Home, Briefcase, Star } from "lucide-react";
import TurkiyeAddressSelect from "./TurkiyeAddressSelect";

export type Address = {
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

const emptyForm: FormState = {
  title: "", fullName: "", phone: "0 (5", street: "",
  district: "", city: "", neighbourhood: "",
  postalCode: "", country: "Türkiye", isDefault: false,
};

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  addresses: Address[];
  onSelect: (address: Address) => void;
  onUpdateAddresses: (newAddresses: Address[]) => void;
}

export default function AddressModal({
  isOpen,
  onClose,
  addresses,
  onSelect,
  onUpdateAddresses,
}: AddressModalProps) {
  const [view, setView] = useState<"list" | "form">("list");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

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
    setView("form");
  }

  function startNew() {
    setForm(emptyForm);
    setEditId(null);
    setView("form");
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

  async function handleSubmit() {
    setLoading(true);
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

    try {
      if (editId) {
        const res = await fetch(`/api/user/addresses/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const json = await res.json();
        if (json.data) {
          const updated = addresses.map((a) => 
            a.id === editId ? json.data : (json.data.isDefault ? { ...a, isDefault: false } : a)
          );
          onUpdateAddresses(updated);
          onSelect(json.data);
        }
      } else {
        const res = await fetch("/api/user/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const json = await res.json();
        if (json.data) {
          const updated = [
            ...(json.data.isDefault ? addresses.map((a) => ({ ...a, isDefault: false })) : addresses),
            json.data,
          ];
          onUpdateAddresses(updated);
          onSelect(json.data);
        }
      }
      setView("list");
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const inputCls = "w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 dark:focus:border-indigo-500 transition-all text-zinc-900 dark:text-zinc-50 placeholder-zinc-400";
  const labelCls = "block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1.5";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-xl bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              {view === "list" ? "Adres Seçin" : (editId ? "Adresi Düzenle" : "Yeni Adres Ekle")}
            </h2>
            <p className="text-sm text-zinc-500 mt-1">
              {view === "list" ? "Siparişinizin gönderileceği adresi seçin." : "Lütfen adres bilgilerini eksiksiz doldurun."}
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 pt-6 overscroll-contain">
          {view === "list" ? (
            <div className="space-y-4">
              {addresses.map((a) => (
                <div 
                  key={a.id}
                  className="group relative bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-all cursor-pointer"
                  onClick={() => { onSelect(a); onClose(); }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-400 group-hover:text-indigo-500 transition-colors shrink-0">
                        {a.title.toLowerCase().includes("ev") ? <Home className="h-5 w-5" /> : (a.title.toLowerCase().includes("iş") ? <Briefcase className="h-5 w-5" /> : <MapPin className="h-5 w-5" />)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-zinc-900 dark:text-zinc-50">{a.title}</h4>
                          {a.isDefault && (
                            <span className="flex items-center gap-1 text-[10px] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                              <Star className="h-2.5 w-2.5 fill-current" /> Varsayılan
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mt-0.5">{a.fullName}</p>
                        <p className="text-xs text-zinc-500 mt-2 line-clamp-1">{a.street}</p>
                        <p className="text-xs text-zinc-500">{a.district}, {a.city}</p>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); startEdit(a); }}
                      className="p-2 rounded-xl text-zinc-400 hover:bg-white dark:hover:bg-zinc-800 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition-all"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              <button 
                type="button"
                onClick={startNew}
                className="w-full h-16 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-center gap-2 text-zinc-500 hover:border-indigo-500 hover:text-indigo-500 transition-all"
              >
                <Plus className="h-5 w-5" />
                <span className="text-sm font-semibold">Yeni Adres Ekle</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Adres Başlığı *</label>
                  <input 
                    value={form.title} 
                    onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="Ev, İş, Okul..."
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

              <TurkiyeAddressSelect 
                value={{ city: form.city, district: form.district, neighbourhood: form.neighbourhood }}
                onChange={(v) => setForm(f => ({ ...f, city: v.city, district: v.district, neighbourhood: v.neighbourhood }))}
                inputClassName={inputCls}
                labelClassName={labelCls}
                required
              />

              <div>
                <label className={labelCls}>Açık Adres (Cadde, Sokak, Bina...) *</label>
                <textarea 
                  rows={2}
                  value={form.street}
                  onChange={(e) => setForm(f => ({ ...f, street: e.target.value }))}
                  className={`${inputCls} resize-none`}
                  placeholder="Cadde, sokak, bina no, daire no..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                  <label className={labelCls}>Telefon *</label>
                  <input 
                    value={form.phone} 
                    onChange={handlePhoneChange}
                    placeholder="05xx xxx xx xx"
                    className={inputCls}
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer group">
                <div 
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${form.isDefault ? "bg-indigo-600 border-indigo-600" : "border-zinc-200 dark:border-zinc-700 group-hover:border-zinc-400"}`}
                  onClick={() => setForm(f => ({ ...f, isDefault: !f.isDefault }))}
                >
                  <input 
                    type="checkbox"
                    className="hidden"
                    checked={form.isDefault}
                    readOnly
                  />
                  {form.isDefault && <Check className="h-3 w-3 text-white" />}
                </div>
                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Varsayılan adres olarak ayarla</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || !form.title || !form.fullName || !form.street || !form.city || !form.district || !form.phone}
                  className="flex-1 h-14 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
                  {editId ? "Güncelle" : "Adresi Kaydet"}
                </button>
                <button 
                  type="button"
                  onClick={() => setView("list")}
                  className="px-6 h-14 border border-zinc-200 dark:border-zinc-800 text-zinc-500 rounded-2xl font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
                >
                  İptal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
