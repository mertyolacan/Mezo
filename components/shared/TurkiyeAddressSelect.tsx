"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronDown, Search, Loader2, CheckIcon } from "lucide-react";

type Location = { id: number; name: string };

interface SelectProps {
  value: string;
  placeholder: string;
  options: Location[];
  loading?: boolean;
  disabled?: boolean;
  onSelect: (loc: Location) => void;
  inputClassName?: string;
}

function SearchableDropdown({
  value,
  placeholder,
  options,
  loading,
  disabled,
  onSelect,
  inputClassName,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = search
    ? options.filter((o) =>
        o.name.toLocaleLowerCase("tr").includes(search.toLocaleLowerCase("tr"))
      )
    : options;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open]);

  function handleToggle() {
    if (disabled) return;
    setOpen((v) => !v);
    if (!open) setSearch("");
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        aria-expanded={open}
        className={`
          ${inputClassName}
          w-full flex items-center justify-between text-left gap-2
          transition-all duration-150
          ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-500"}
          ${open ? "ring-2 ring-brand-primary/30 border-brand-primary dark:border-brand-primary" : ""}
        `}
      >
        <span className={`truncate flex-1 ${value ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-400 dark:text-zinc-500"}`}>
          {value || placeholder}
        </span>
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-zinc-400 shrink-0" />
        ) : (
          <ChevronDown
            className={`h-4 w-4 text-zinc-400 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        )}
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-2xl shadow-zinc-900/10 dark:shadow-zinc-900/40 overflow-hidden">
          {/* Search */}
          <div className="p-2.5 border-b border-zinc-100 dark:border-zinc-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
              <input
                ref={searchRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Ara..."
                className="w-full pl-8 pr-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary dark:focus:border-brand-primary transition-all text-zinc-900 dark:text-zinc-50 placeholder-zinc-400"
              />
            </div>
          </div>

          {/* List */}
          <div className="max-h-56 overflow-y-auto overscroll-contain">
            {filtered.length === 0 ? (
              <p className="text-xs text-zinc-400 text-center py-5">
                {search ? `"${search}" bulunamadı` : "Sonuç yok"}
              </p>
            ) : (
              filtered.map((loc) => {
                const isSelected = value === loc.name;
                return (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => {
                      onSelect(loc);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={`
                      w-full text-left px-4 py-2.5 text-sm flex items-center gap-2.5 transition-colors
                      ${isSelected
                        ? "bg-brand-primary/5 dark:bg-brand-primary/10/40 text-brand-primary dark:text-brand-primary font-semibold"
                        : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/70"
                      }
                    `}
                  >
                    <span className="flex-1">{loc.name}</span>
                    {isSelected && <CheckIcon className="h-3.5 w-3.5 shrink-0 text-brand-primary" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export interface TurkiyeAddressValue {
  city: string;
  district: string;
  neighbourhood: string;
}

interface TurkiyeAddressSelectProps {
  value: TurkiyeAddressValue;
  onChange: (val: TurkiyeAddressValue) => void;
  inputClassName?: string;
  labelClassName?: string;
  required?: boolean;
}

export default function TurkiyeAddressSelect({
  value,
  onChange,
  inputClassName,
  labelClassName,
  required,
}: TurkiyeAddressSelectProps) {
  const [iller, setIller] = useState<Location[]>([]);
  const [ilceler, setIlceler] = useState<Location[]>([]);
  const [mahalleler, setMahalleler] = useState<Location[]>([]);

  const [selectedIlId, setSelectedIlId] = useState<number | null>(null);
  const [selectedIlceId, setSelectedIlceId] = useState<number | null>(null);

  const [loadingIller, setLoadingIller] = useState(true);
  const [loadingIlceler, setLoadingIlceler] = useState(false);
  const [loadingMahalleler, setLoadingMahalleler] = useState(false);

  // Fetch iller on mount
  useEffect(() => {
    fetch("/api/locations?type=iller")
      .then((r) => r.json())
      .then((data: Location[]) => {
        setIller(data);
        setLoadingIller(false);
        // If we already have a city value, try to find it
        if (value.city) {
          const found = data.find(
            (il) => il.name.toLocaleLowerCase("tr") === value.city.toLocaleLowerCase("tr")
          );
          if (found) {
            setSelectedIlId(found.id);
            fetchIlceler(found.id, value.district);
          }
        }
      })
      .catch(() => setLoadingIller(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function fetchIlceler(ilId: number, preselectedDistrict?: string) {
    setLoadingIlceler(true);
    fetch(`/api/locations?type=ilceler&id=${ilId}`)
      .then((r) => r.json())
      .then((data: Location[]) => {
        setIlceler(data);
        setLoadingIlceler(false);
        if (preselectedDistrict) {
          const found = data.find(
            (d) => d.name.toLocaleLowerCase("tr") === preselectedDistrict.toLocaleLowerCase("tr")
          );
          if (found) {
            setSelectedIlceId(found.id);
            fetchMahalleler(found.id);
          }
        }
      })
      .catch(() => setLoadingIlceler(false));
  }

  function fetchMahalleler(ilceId: number) {
    setLoadingMahalleler(true);
    fetch(`/api/locations?type=mahalleler&id=${ilceId}`)
      .then((r) => r.json())
      .then((data: Location[]) => {
        setMahalleler(data);
        setLoadingMahalleler(false);
      })
      .catch(() => setLoadingMahalleler(false));
  }

  const handleIlSelect = useCallback(
    (loc: Location) => {
      setSelectedIlId(loc.id);
      setSelectedIlceId(null);
      setIlceler([]);
      setMahalleler([]);
      onChange({ city: loc.name, district: "", neighbourhood: "" });
      fetchIlceler(loc.id);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onChange]
  );

  const handleIlceSelect = useCallback(
    (loc: Location) => {
      setSelectedIlceId(loc.id);
      setMahalleler([]);
      onChange({ city: value.city, district: loc.name, neighbourhood: "" });
      fetchMahalleler(loc.id);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onChange, value.city]
  );

  const handleMahalleSelect = useCallback(
    (loc: Location) => {
      onChange({ city: value.city, district: value.district, neighbourhood: loc.name });
    },
    [onChange, value.city, value.district]
  );

  const defaultInputCls =
    "w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-3 text-sm";
  const inCls = inputClassName || defaultInputCls;

  const lbl =
    labelClassName ||
    "block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1.5";

  return (
    <div className="space-y-3">
      {/* İl */}
      <div>
        <label className={lbl}>
          İl{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <SearchableDropdown
          value={value.city}
          placeholder={loadingIller ? "Yükleniyor..." : "İl seçin..."}
          options={iller}
          loading={loadingIller}
          onSelect={handleIlSelect}
          inputClassName={inCls}
        />
      </div>

      {/* İlçe */}
      <div>
        <label className={lbl}>
          İlçe{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <SearchableDropdown
          value={value.district}
          placeholder={value.city ? (loadingIlceler ? "Yükleniyor..." : "İlçe seçin...") : "Önce il seçin"}
          options={ilceler}
          loading={loadingIlceler}
          disabled={!value.city}
          onSelect={handleIlceSelect}
          inputClassName={inCls}
        />
      </div>

      {/* Mahalle */}
      <div>
        <label className={lbl}>Mahalle</label>
        <SearchableDropdown
          value={value.neighbourhood}
          placeholder={
            value.district
              ? loadingMahalleler
                ? "Yükleniyor..."
                : "Mahalle seçin..."
              : "Önce ilçe seçin"
          }
          options={mahalleler}
          loading={loadingMahalleler}
          disabled={!value.district}
          onSelect={handleMahalleSelect}
          inputClassName={inCls}
        />
      </div>
    </div>
  );
}
