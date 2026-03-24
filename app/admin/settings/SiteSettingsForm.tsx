"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Loader2, Check, Phone, Mail, MapPin, Clock,
  Instagram, Youtube, Linkedin, CreditCard, Truck,
  Building2, AtSign, MessageCircle,
  Twitter, Facebook, Music2,
} from "lucide-react";
import { updateSiteSettings, type SiteSettingsInput } from "@/lib/actions/settings";
import ImageInput from "@/components/admin/ImageInput";

type Props = { initialSettings: SiteSettingsInput };

type Tab = "general" | "contact" | "payment";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "general", label: "Genel",            icon: Building2 },
  { id: "contact", label: "İletişim & Sosyal", icon: Phone },
  { id: "payment", label: "Ödeme",             icon: CreditCard },
];

export default function SiteSettingsForm({ initialSettings }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, watch, setValue } = useForm<SiteSettingsInput>({
    defaultValues: initialSettings,
  });

  async function onSubmit(data: SiteSettingsInput) {
    setLoading(true);
    setError("");
    try {
      await updateSiteSettings(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Kaydedilemedi. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  const inp = "w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all";
  const lbl = "block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5";

  const SectionHeader = ({
    icon: Icon,
    title,
    desc,
    color = "text-indigo-500",
  }: {
    icon: React.ElementType;
    title: string;
    desc?: string;
    color?: string;
  }) => (
    <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 flex items-center gap-3">
      <div className={`p-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">{title}</h2>
        {desc && <p className="text-[11px] text-zinc-400 mt-0.5">{desc}</p>}
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Tab Bar */}
      <div className="flex gap-1 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-2xl mb-6 border border-zinc-200 dark:border-zinc-800">
        {TABS.map(({ id, label: tabLabel, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === id
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200 dark:border-zinc-700"
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">{tabLabel}</span>
          </button>
        ))}
      </div>

      {/* Tab: Genel */}
      {activeTab === "general" && (
        <div className="animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
            <SectionHeader icon={Building2} title="Site Kimliği" desc="Sitenizin temel marka bilgileri" />
            <div className="p-6 space-y-5">
              <div>
                <label className={lbl}>Site Adı</label>
                <input {...register("siteName")} className={inp} placeholder="MesoPro" />
              </div>
              <div>
                <label className={lbl}>Slogan</label>
                <input {...register("siteTagline")} className={inp} placeholder="Profesyonel Mezoterapi Ürünleri" />
              </div>
              <div>
                <label className={lbl}>Logo URL</label>
                <ImageInput
                  value={watch("logoUrl") ?? ""}
                  onChange={(url) => setValue("logoUrl", url, { shouldDirty: true })}
                  previewType="square"
                  inputClass={inp}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: İletişim & Sosyal */}
      {activeTab === "contact" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
            <SectionHeader icon={Phone} title="İletişim Bilgileri" desc="Müşterilere gösterilecek bilgiler" color="text-blue-500" />
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={lbl}><Mail className="inline h-3.5 w-3.5 mr-1" />E-posta</label>
                  <input type="email" {...register("contactEmail")} className={inp} placeholder="info@mesopro.com.tr" />
                </div>
                <div>
                  <label className={lbl}><Phone className="inline h-3.5 w-3.5 mr-1" />Telefon</label>
                  <input {...register("contactPhone")} className={inp} placeholder="+90 212 000 00 00" />
                </div>
              </div>
              <div>
                <label className={lbl}><MapPin className="inline h-3.5 w-3.5 mr-1" />Adres</label>
                <textarea rows={2} {...register("contactAddress")} className={inp} placeholder="İstanbul, Türkiye" />
              </div>
              <div>
                <label className={lbl}><Clock className="inline h-3.5 w-3.5 mr-1" />Çalışma Saatleri</label>
                <input {...register("workingHours")} className={inp} placeholder="Pzt–Cum: 09:00–18:00" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
            <SectionHeader icon={AtSign} title="Sosyal Medya" desc="Platform bağlantıları" color="text-pink-500" />
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  { name: "socialInstagram" as const, label: "Instagram",  icon: Instagram,      placeholder: "https://instagram.com/..." },
                  { name: "socialFacebook"  as const, label: "Facebook",   icon: Facebook,       placeholder: "https://facebook.com/..." },
                  { name: "socialTwitter"   as const, label: "X (Twitter)", icon: Twitter,       placeholder: "https://x.com/..." },
                  { name: "socialYoutube"   as const, label: "YouTube",    icon: Youtube,        placeholder: "https://youtube.com/..." },
                  { name: "socialLinkedin"  as const, label: "LinkedIn",   icon: Linkedin,       placeholder: "https://linkedin.com/..." },
                  { name: "socialTiktok"    as const, label: "TikTok",     icon: Music2,         placeholder: "https://tiktok.com/..." },
                  { name: "socialWhatsapp"  as const, label: "WhatsApp",   icon: MessageCircle,  placeholder: "905xxxxxxxxx" },
                ].map(({ name, label: lbl2, icon: Icon, placeholder }) => (
                  <div key={name}>
                    <label className={lbl}><Icon className="inline h-3.5 w-3.5 mr-1" />{lbl2}</label>
                    <input {...register(name)} className={inp} placeholder={placeholder} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Ödeme */}
      {activeTab === "payment" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
            <SectionHeader icon={CreditCard} title="Ödeme Yöntemleri" desc="Checkout sayfasında sunulacak ödeme seçenekleri" color="text-emerald-500" />
            <div className="p-6 space-y-3">
              {[
                { name: "paymentCodEnabled" as const,  label: "Kapıda Ödeme",        desc: "Nakit veya kart ile kapıda ödeme",       icon: Truck },
                { name: "paymentCardEnabled" as const, label: "Kredi / Banka Kartı", desc: "iyzico güvencesiyle online kart ödemesi", icon: CreditCard },
              ].map(({ name, label: lbl2, desc, icon: Icon }) => {
                const enabled = !!watch(name);
                return (
                  <div
                    key={name}
                    className={`flex items-center justify-between gap-4 p-4 rounded-2xl border transition-all ${
                      enabled
                        ? "bg-indigo-50/40 dark:bg-indigo-500/5 border-indigo-200 dark:border-indigo-500/20"
                        : "bg-zinc-50 dark:bg-zinc-800/30 border-zinc-200 dark:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${enabled ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{lbl2}</p>
                        <p className="text-xs text-zinc-400">{desc}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setValue(name, !enabled)}
                      className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ${enabled ? "bg-indigo-600" : "bg-zinc-200 dark:bg-zinc-700"}`}
                      role="switch"
                      aria-checked={enabled}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform duration-200 ${enabled ? "translate-x-5" : "translate-x-0"}`} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Sticky Save Footer */}
      <div className="sticky bottom-0 z-30 -mx-6 px-6 py-4 mt-6 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4">
        <p className="text-xs text-zinc-400 hidden sm:block">Tüm sekmeler aynı anda kaydedilir.</p>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-bold px-8 py-2.5 rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98]"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {saved && <Check className="h-4 w-4" />}
          {loading ? "Kaydediliyor..." : saved ? "Kaydedildi!" : "Kaydet"}
        </button>
      </div>
    </form>
  );
}
