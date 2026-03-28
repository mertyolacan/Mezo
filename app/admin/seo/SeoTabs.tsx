"use client";

import { useState } from "react";
import { Settings2, FileText, Globe, BarChart3 } from "lucide-react";
import GlobalSettingsForm from "./GlobalSettingsForm";
import SeoManager from "./SeoManager";
import { type GlobalSettingsInput } from "@/lib/validations/seo";

type Props = {
  globalData?: GlobalSettingsInput;
  pages: Array<{ page: string; label: string; previewSlug?: string }>;
  seoMap: Record<string, any>;
};

const TABS = [
  {
    id: "global" as const,
    label: "Genel SEO Ayarları",
    shortLabel: "Genel",
    icon: Settings2,
    desc: "Site geneli varsayılan değerler, analytics ve scriptler",
  },
  {
    id: "pages" as const,
    label: "Sayfa Bazlı SEO",
    shortLabel: "Sayfalar",
    icon: FileText,
    desc: "Her sayfa için özel başlık, açıklama ve meta ayarları",
  },
];

export default function SeoTabs({ globalData, pages, seoMap }: Props) {
  const [activeTab, setActiveTab] = useState<"global" | "pages">("global");
  const active = TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200 dark:border-zinc-700"
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-brand-primary dark:text-brand-primary" : ""}`} />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.shortLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab Info */}
      <div className="flex items-center gap-2 px-1">
        <active.icon className="h-4 w-4 text-zinc-400" />
        <p className="text-xs text-zinc-500">{active.desc}</p>
      </div>

      {/* Content */}
      <div className="animate-in fade-in slide-in-from-top-1 duration-200">
        {activeTab === "global" ? (
          <GlobalSettingsForm initialData={globalData} />
        ) : (
          <SeoManager pages={pages} seoMap={seoMap} />
        )}
      </div>
    </div>
  );
}
