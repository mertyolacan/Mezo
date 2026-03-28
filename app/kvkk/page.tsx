import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KVKK & Gizlilik Politikası",
  description: "MesoPro kişisel verilerin korunması ve gizlilik politikası hakkında bilgi.",
};

export default function KvkkPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
        KVKK & Gizlilik Politikası
      </h1>
      <p className="text-zinc-500 text-sm mb-10">Son güncelleme: Mart 2026</p>

      <div className="prose prose-zinc dark:prose-invert max-w-none text-sm leading-relaxed space-y-8">

        <section>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-3">1. Veri Sorumlusu</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Firmamız olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında veri sorumlusu sıfatıyla
            kişisel verilerinizi işlemekteyiz. Bu politika, hangi verileri topladığımızı, nasıl kullandığımızı ve
            haklarınızı açıklamaktadır.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-3">2. Toplanan Kişisel Veriler</h2>
          <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-400 space-y-1">
            <li>Ad, soyad, e-posta adresi, telefon numarası</li>
            <li>Teslimat ve fatura adresi bilgileri</li>
            <li>Sipariş ve ödeme geçmişi</li>
            <li>IP adresi ve tarayıcı bilgileri (çerezler aracılığıyla)</li>
            <li>Destek talebi içerikleri</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-3">3. Verilerin İşlenme Amaçları</h2>
          <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-400 space-y-1">
            <li>Sipariş ve ödeme işlemlerinin gerçekleştirilmesi</li>
            <li>Üyelik ve hesap yönetimi</li>
            <li>Müşteri destek hizmetlerinin sağlanması</li>
            <li>Yasal yükümlülüklerin yerine getirilmesi</li>
            <li>Hizmet kalitesinin iyileştirilmesi</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-3">4. Verilerin Aktarımı</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Kişisel verileriniz; ödeme işlemleri için iyzico, görsel depolama için Cloudinary, veritabanı hizmetleri için
            Neon gibi hizmet sağlayıcılarla — yalnızca hizmetin gerektirdiği ölçüde — paylaşılmaktadır.
            Bu aktarımlar KVKK'nın 8. ve 9. maddeleri kapsamında gerçekleştirilmektedir.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-3">5. Çerezler</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Sitemizde oturum yönetimi, tercih hatırlama ve hizmet iyileştirme amacıyla çerezler kullanılmaktadır.
            Tarayıcı ayarlarınızdan çerezleri devre dışı bırakabilirsiniz; ancak bu durumda bazı özellikler
            çalışmayabilir.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-3">6. Saklama Süresi</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Kişisel verileriniz, işlenme amacının ortadan kalkmasıyla birlikte silinmekte, yok edilmekte veya
            anonim hale getirilmektedir. Sipariş ve fatura bilgileri yasal yükümlülükler gereği 10 yıl saklanmaktadır.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-3">7. KVKK Kapsamındaki Haklarınız</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-2">KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:</p>
          <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-400 space-y-1">
            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
            <li>İşlenmişse buna ilişkin bilgi talep etme</li>
            <li>İşlenme amacını ve amaca uygun kullanılıp kullanılmadığını öğrenme</li>
            <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
            <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme</li>
            <li>Silinmesini veya yok edilmesini isteme</li>
            <li>İşlemeye itiraz etme</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-3">8. İletişim</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            KVKK kapsamındaki talepleriniz için{" "}
            <a href="/contact" className="text-indigo-600 dark:text-indigo-400 hover:underline">
              iletişim formumuz
            </a>{" "}
            aracılığıyla bize ulaşabilirsiniz.
          </p>
        </section>

      </div>
    </div>
  );
}
