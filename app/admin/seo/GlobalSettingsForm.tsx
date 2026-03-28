"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GlobalSettingsSchema, type GlobalSettingsInput } from "@/lib/validations/seo";
import { updateGlobalSettings } from "@/lib/actions/seo";
import { useState } from "react";
import { Loader2, Check, Fingerprint, BarChart3, Globe } from "lucide-react";
import ImageInput from "@/components/admin/ImageInput";

type Props = { initialData?: GlobalSettingsInput };

const SectionHeader = ({
  icon: Icon,
  title,
  desc,
  color = "text-brand-primary",
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

export default function GlobalSettingsForm({ initialData }: Props) {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const methods = useForm<GlobalSettingsInput>({
    resolver: zodResolver(GlobalSettingsSchema) as any,
    defaultValues: initialData || {
      siteName: "MesoPro",
      titleSeparator: " | ",
      defaultDescription: "",
      defaultOgImage: "",
      gaId: "",
      gscId: "",
      faviconUrl: "",
      customScripts: { head: "", bodyStart: "", bodyEnd: "" },
    },
  });

  async function onSubmit(data: GlobalSettingsInput) {
    setLoading(true);
    try {
      await updateGlobalSettings(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Ayarlar kaydedilirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all outline-none";
  const labelClass = "block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5";

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">

        {/* 1. Site Kimliği */}
        <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
          <SectionHeader icon={Fingerprint} title="Site Kimliği" desc="Arama motorlarında görünen temel marka bilgileri" />
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Başlık Ayırıcı</label>
              <input {...methods.register("titleSeparator")} className={inputClass} placeholder=" | " />
              <p className="text-[11px] text-zinc-400 mt-1.5">
                Örnek: <span className="font-mono">Ürünler {methods.watch("titleSeparator") || " | "} {methods.watch("siteName") || "MesoPro"}</span>
                <span className="ml-2 text-zinc-300 dark:text-zinc-600">— Site adı <a href="/admin/settings" className="text-brand-primary hover:underline">Ayarlar</a>'dan yönetilir</span>
              </p>
            </div>
            <div>
              <label className={labelClass}>Favicon URL</label>
              <ImageInput
                value={methods.watch("faviconUrl") ?? ""}
                onChange={(url) => methods.setValue("faviconUrl", url, { shouldDirty: true })}
                previewType="favicon"
                inputClass={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Google Search Console ID</label>
              <input {...methods.register("gscId")} className={inputClass} placeholder="GSC doğrulama kodu" />
            </div>
          </div>
        </section>

        {/* siteName hidden — Settings sayfasından yönetilir, kayıtta korunur */}
        <input type="hidden" {...methods.register("siteName")} />

        {/* 2. Global SEO (Fallback) */}
        <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
          <SectionHeader icon={Globe} title="Site Geneli SEO (Fallback)" desc="Sayfa bazlı ayar yoksa bu değerler kullanılır" color="text-emerald-500" />
          <div className="p-6 space-y-5">
            {/* Varsayılan Başlık — bilgi notu */}
            <div>
              <label className={labelClass}>Varsayılan Başlık</label>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl">
                <span className="text-sm font-mono text-zinc-700 dark:text-zinc-300 truncate">
                  {methods.watch("siteName") || "Site Adı"}
                  <span className="text-zinc-400 mx-1">{methods.watch("titleSeparator") || " | "}</span>
                  <span className="text-zinc-400">Slogan</span>
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1.5">
                Site Adı ve Slogan <a href="/admin/settings" className="text-brand-primary hover:underline">Genel Ayarlar</a>'dan, ayırıcı yukarıdaki alandan yönetilir.
              </p>
            </div>

            <div>
              <label className={labelClass}>Varsayılan Meta Açıklama</label>
              <textarea
                {...methods.register("defaultDescription")}
                rows={3}
                className={`${inputClass} resize-none`}
                placeholder="Arama sonuçlarında görünecek genel site açıklaması..."
              />
              <p className="text-[11px] text-zinc-400 mt-1.5">Maks. 160 karakter. Sayfa bazlı açıklama yoksa kullanılır.</p>
            </div>
            <div>
              <label className={labelClass}>Varsayılan OG Görseli</label>
              <ImageInput
                value={methods.watch("defaultOgImage") ?? ""}
                onChange={(url) => methods.setValue("defaultOgImage", url, { shouldDirty: true })}
                previewType="video"
                inputClass={inputClass}
              />
              <p className="text-[11px] text-zinc-400 mt-1.5">Sosyal medyada paylaşımlarda görünür. Önerilen: 1200×630px.</p>
            </div>
          </div>
        </section>

        {/* 3. Analytics & Scripts */}
        <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
          <SectionHeader icon={BarChart3} title="Analytics ve Özel Scriptler" desc="İzleme araçları ve özel kod enjeksiyonu" color="text-amber-500" />
          <div className="p-6 space-y-5">
            <div>
              <label className={labelClass}>Google Analytics ID</label>
              <input {...methods.register("gaId")} className={inputClass} placeholder="G-XXXXXXXXXX" />
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl">
              <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">Script alanları yalnızca güvenilir kaynaklardan gelen kodlar için kullanılmalıdır.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { name: "customScripts.head" as const,      label: "Head Script",         tag: "<head>" },
                { name: "customScripts.bodyStart" as const, label: "Body Başlangıç",       tag: "<body>" },
                { name: "customScripts.bodyEnd" as const,   label: "Body Bitiş",          tag: "</body>" },
              ].map(({ name, label: lbl, tag }) => (
                <div key={name}>
                  <label className={labelClass}>
                    <span className="font-mono text-[11px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded mr-1.5">{tag}</span>
                    {lbl}
                  </label>
                  <textarea
                    {...methods.register(name)}
                    rows={5}
                    className={`${inputClass} font-mono text-[11px] resize-none`}
                    placeholder="<script>...</script>"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Sticky Save Footer */}
        <div className="sticky bottom-0 z-30 -mx-6 px-6 py-4 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4">
          <p className="text-xs text-zinc-400 hidden sm:block">Değişiklikler kaydedilmeden önce geçerli değildir.</p>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary-light disabled:opacity-50 text-white font-bold px-10 py-2.5 rounded-xl shadow-lg shadow-brand-primary/20 transition-all active:scale-[0.98]"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : null}
            {loading ? "Kaydediliyor..." : saved ? "Kaydedildi!" : "Tüm Ayarları Kaydet"}
          </button>
        </div>
      </form>
    </FormProvider>
  );
}
