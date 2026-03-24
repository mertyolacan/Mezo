"use client";

export default function SortSelect({ value }: { value?: string }) {
  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const url = new URL(window.location.href);
    if (e.target.value) url.searchParams.set("sort", e.target.value);
    else url.searchParams.delete("sort");
    window.location.href = url.toString();
  }

  return (
    <select
      defaultValue={value ?? ""}
      onChange={handleChange}
      className="text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 px-3 py-1.5 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      <option value="">En yeni</option>
      <option value="price-asc">Fiyat: Düşükten yükseğe</option>
      <option value="price-desc">Fiyat: Yüksekten düşüğe</option>
    </select>
  );
}
