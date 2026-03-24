"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, GripVertical, ExternalLink, Loader2, Check } from "lucide-react";

type NavItem = {
  id: number;
  menuId: number;
  label: string;
  url: string;
  target: string;
  sortOrder: number;
  isActive: boolean;
  parentId: number | null;
};

type NavMenu = {
  id: number;
  name: string;
  location: string;
  items: NavItem[];
};

export default function NavigationManager({ initialMenus }: { initialMenus: NavMenu[] }) {
  const [menus, setMenus] = useState(initialMenus);
  const [selectedMenuId, setSelectedMenuId] = useState(initialMenus[0]?.id ?? null);
  const [newMenuName, setNewMenuName] = useState("");
  const [newMenuLocation, setNewMenuLocation] = useState("");
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [itemSaved, setItemSaved] = useState(false);
  const router = useRouter();

  const selectedMenu = menus.find((m) => m.id === selectedMenuId);

  const [newItem, setNewItem] = useState({ label: "", url: "", target: "_self" });
  const [showNewItem, setShowNewItem] = useState(false);
  const [editItem, setEditItem] = useState<NavItem | null>(null);

  async function createMenu() {
    if (!newMenuName || !newMenuLocation) return;
    setLoading(true);
    const res = await fetch("/api/nav", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newMenuName, location: newMenuLocation }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setMenus((prev) => [...prev, { ...data.data, items: [] }]);
      setSelectedMenuId(data.data.id);
      setNewMenuName("");
      setNewMenuLocation("");
      setShowNewMenu(false);
    }
  }

  async function addItem() {
    if (!selectedMenuId || !newItem.label || !newItem.url) return;
    setLoading(true);
    const res = await fetch(`/api/nav/${selectedMenuId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newItem, sortOrder: selectedMenu?.items.length ?? 0 }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setMenus((prev) =>
        prev.map((m) => (m.id === selectedMenuId ? { ...m, items: [...m.items, data.data] } : m))
      );
      setNewItem({ label: "", url: "", target: "_self" });
      setShowNewItem(false);
    }
  }

  async function deleteItem(itemId: number) {
    if (!selectedMenuId) return;
    await fetch(`/api/nav/${selectedMenuId}/items/${itemId}`, { method: "DELETE" });
    setMenus((prev) =>
      prev.map((m) =>
        m.id === selectedMenuId ? { ...m, items: m.items.filter((i) => i.id !== itemId) } : m
      )
    );
  }

  async function saveItem() {
    if (!editItem || !selectedMenuId) return;
    setLoading(true);
    const res = await fetch(`/api/nav/${selectedMenuId}/items/${editItem.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editItem),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setMenus((prev) =>
        prev.map((m) =>
          m.id === selectedMenuId
            ? { ...m, items: m.items.map((i) => (i.id === editItem.id ? data.data : i)) }
            : m
        )
      );
      setItemSaved(true);
      setTimeout(() => { setItemSaved(false); setEditItem(null); }, 1500);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition";

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* Menu list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Menüler</h2>
          <button
            onClick={() => setShowNewMenu(!showNewMenu)}
            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <Plus className="h-4 w-4 text-zinc-500" />
          </button>
        </div>

        {showNewMenu && (
          <div className="space-y-2 p-3 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <input className={inputClass} placeholder="Menü adı" value={newMenuName} onChange={(e) => setNewMenuName(e.target.value)} />
            <input className={inputClass} placeholder="Konum (örn: header, footer)" value={newMenuLocation} onChange={(e) => setNewMenuLocation(e.target.value)} />
            <button
              onClick={createMenu}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white text-sm font-semibold py-1.5 rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors"
            >
              {loading && <Loader2 className="h-3 w-3 animate-spin" />}
              Oluştur
            </button>
          </div>
        )}

        <div className="space-y-1">
          {menus.map((menu) => (
            <button
              key={menu.id}
              onClick={() => setSelectedMenuId(menu.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                selectedMenuId === menu.id
                  ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-medium"
                  : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              }`}
            >
              <span className="block font-medium">{menu.name}</span>
              <span className="block text-xs text-zinc-400">{menu.location}</span>
            </button>
          ))}
          {menus.length === 0 && (
            <p className="text-sm text-zinc-400 px-3 py-2">Henüz menü yok</p>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="md:col-span-2 space-y-3">
        {selectedMenu ? (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                {selectedMenu.name} — Menü Öğeleri
              </h2>
              <button
                onClick={() => setShowNewItem(!showNewItem)}
                className="flex items-center gap-1.5 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <Plus className="h-4 w-4" />
                Öğe Ekle
              </button>
            </div>

            {showNewItem && (
              <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1">Etiket</label>
                    <input className={inputClass} placeholder="Anasayfa" value={newItem.label} onChange={(e) => setNewItem((p) => ({ ...p, label: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1">URL</label>
                    <input className={inputClass} placeholder="/products" value={newItem.url} onChange={(e) => setNewItem((p) => ({ ...p, url: e.target.value }))} />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    className={`${inputClass} w-auto`}
                    value={newItem.target}
                    onChange={(e) => setNewItem((p) => ({ ...p, target: e.target.value }))}
                  >
                    <option value="_self">Aynı sekme</option>
                    <option value="_blank">Yeni sekme</option>
                  </select>
                  <button
                    onClick={addItem}
                    disabled={loading}
                    className="flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors"
                  >
                    {loading && <Loader2 className="h-3 w-3 animate-spin" />}
                    Ekle
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {selectedMenu.items.map((item) => (
                <div key={item.id}>
                  {editItem?.id === item.id ? (
                    <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border-2 border-indigo-300 dark:border-indigo-700 space-y-3">
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-zinc-500 mb-1">Etiket</label>
                          <input className={inputClass} value={editItem.label} onChange={(e) => setEditItem((p) => p && { ...p, label: e.target.value })} />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-zinc-500 mb-1">URL</label>
                          <input className={inputClass} value={editItem.url} onChange={(e) => setEditItem((p) => p && { ...p, url: e.target.value })} />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <select
                          className={`${inputClass} w-auto`}
                          value={editItem.target}
                          onChange={(e) => setEditItem((p) => p && { ...p, target: e.target.value })}
                        >
                          <option value="_self">Aynı sekme</option>
                          <option value="_blank">Yeni sekme</option>
                        </select>
                        <button onClick={saveItem} disabled={loading || itemSaved} className={`flex items-center gap-2 text-white text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-60 transition-colors ${itemSaved ? "bg-green-500" : "bg-indigo-600 hover:bg-indigo-700"}`}>
                          {loading && <Loader2 className="h-3 w-3 animate-spin" />}
                          {!loading && itemSaved && <Check className="h-3 w-3" />}
                          {itemSaved ? "Kaydedildi!" : "Kaydet"}
                        </button>
                        <button onClick={() => setEditItem(null)} className="text-sm text-zinc-500 hover:text-zinc-700">İptal</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 group">
                      <GripVertical className="h-4 w-4 text-zinc-300 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{item.label}</span>
                        <span className="text-xs text-zinc-400 ml-2">{item.url}</span>
                        {item.target === "_blank" && <ExternalLink className="h-3 w-3 text-zinc-400 inline ml-1" />}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditItem(item)}
                          className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline px-2"
                        >
                          Düzenle
                        </button>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="p-1 rounded text-zinc-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {selectedMenu.items.length === 0 && (
                <p className="text-sm text-zinc-400 py-4 text-center">Bu menüde henüz öğe yok</p>
              )}
            </div>
          </>
        ) : (
          <p className="text-sm text-zinc-400">Bir menü seçin veya oluşturun</p>
        )}
      </div>
    </div>
  );
}
