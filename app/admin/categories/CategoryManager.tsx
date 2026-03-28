"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Check, X, Tag, ImageIcon } from "lucide-react";
import Image from "next/image";
import MediaPickerModal from "@/components/admin/MediaPickerModal";

type Category = {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  isActive: boolean;
  sortOrder: number;
  productCount: number;
};

export default function CategoryManager({ initialCategories }: { initialCategories: Category[] }) {
const [categories, setCategories] = useState(initialCategories);
  const [newName, setNewName] = useState("");
  const [newImage, setNewImage] = useState("");
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editImage, setEditImage] = useState("");
  const [pickerFor, setPickerFor] = useState<"new" | "edit" | null>(null);

  const inputClass =
    "rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-brand-primary transition";

  async function handleAdd() {
    if (!newName.trim()) return;
    setAdding(true);
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), image: newImage || null }),
    });
    setAdding(false);
    if (res.ok) {
      const data = await res.json();
      setCategories((prev) => [...prev, { ...data.data, productCount: 0 }]);
      setNewName("");
      setNewImage("");
    }
  }

  async function handleEdit(id: number) {
    if (!editName.trim()) return;
    await fetch(`/api/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName.trim(), image: editImage || null }),
    });
    setCategories((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, name: editName.trim(), image: editImage || null } : c
      )
    );
    setEditId(null);
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`"${name}" kategorisini silmek istediğinize emin misiniz?`)) return;
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }

  async function toggleActive(id: number, current: boolean) {
    await fetch(`/api/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    });
    setCategories((prev) =>
      prev.map((c) => c.id === id ? { ...c, isActive: !current } : c)
    );
  }

  function startEdit(cat: Category) {
    setEditId(cat.id);
    setEditName(cat.name);
    setEditImage(cat.image ?? "");
  }

  return (
    <>
      <MediaPickerModal
        open={pickerFor !== null}
        onClose={() => setPickerFor(null)}
        multiple={false}
        onSelect={(urls) => {
          if (pickerFor === "new") setNewImage(urls[0] ?? "");
          if (pickerFor === "edit") setEditImage(urls[0] ?? "");
        }}
      />

      <div className="max-w-2xl space-y-4">
        {/* Yeni kategori ekle */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Yeni Kategori</p>
          <div className="flex gap-2">
            <input
              className={`${inputClass} flex-1`}
              placeholder="Kategori adı"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <button
              onClick={handleAdd}
              disabled={adding || !newName.trim()}
              className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary-light disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              Ekle
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPickerFor("new")}
              className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-brand-primary dark:hover:text-brand-primary border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 transition-colors"
            >
              <ImageIcon className="h-3.5 w-3.5" />
              Görsel Seç
            </button>
            {newImage && (
              <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 shrink-0">
                <Image src={newImage} alt="" fill className="object-contain p-0.5" sizes="36px" />
              </div>
            )}
            {newImage && (
              <button type="button" onClick={() => setNewImage("")} className="text-xs text-zinc-400 hover:text-red-500 transition-colors">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Liste */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          {categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-400 gap-2">
              <Tag className="h-8 w-8" />
              <p className="text-sm">Henüz kategori yok</p>
            </div>
          ) : (
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {categories.map((cat) => (
                <li key={cat.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  {editId === cat.id ? (
                    <div className="flex-1 flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setPickerFor("edit")}
                        className="relative w-10 h-10 rounded-lg overflow-hidden border-2 border-dashed border-zinc-300 dark:border-zinc-600 hover:border-brand-primary bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center transition-colors shrink-0"
                        title="Görsel değiştir"
                      >
                        {editImage ? (
                          <Image src={editImage} alt="" fill className="object-contain p-0.5" sizes="40px" />
                        ) : (
                          <ImageIcon className="h-4 w-4 text-zinc-400" />
                        )}
                      </button>
                      <input
                        className={`${inputClass} flex-1 min-w-0`}
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleEdit(cat.id)}
                        autoFocus
                      />
                      <button onClick={() => handleEdit(cat.id)} className="p-1.5 text-green-500 hover:bg-green-50 dark:hover:bg-green-950 rounded-lg transition-colors">
                        <Check className="h-4 w-4" />
                      </button>
                      <button onClick={() => setEditId(null)} className="p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 shrink-0 flex items-center justify-center">
                        {cat.image ? (
                          <Image src={cat.image} alt={cat.name} fill className="object-contain p-0.5" sizes="36px" />
                        ) : (
                          <Tag className="h-4 w-4 text-zinc-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">{cat.name}</p>
                        <p className="text-xs text-zinc-400">{cat.productCount} ürün · /{cat.slug}</p>
                      </div>
                      <span
                        onClick={() => toggleActive(cat.id, cat.isActive)}
                        className={`text-xs font-medium px-2 py-0.5 rounded-full cursor-pointer select-none transition-colors ${
                          cat.isActive
                            ? "bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400"
                            : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                        }`}
                      >
                        {cat.isActive ? "Aktif" : "Pasif"}
                      </span>
                      <button
                        onClick={() => startEdit(cat)}
                        className="p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id, cat.name)}
                        className="p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
