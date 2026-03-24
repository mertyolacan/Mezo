import nodemailer from "nodemailer";
import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";

async function getSiteEmail(): Promise<string> {
  const rows = await db.select().from(siteSettings);
  const settings: Record<string, string | null> = {};
  rows.forEach((r) => { settings[r.key] = r.value; });
  return settings["contact_email"] ?? process.env.SMTP_FROM ?? "noreply@mesopro.com.tr";
}

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendOrderConfirmation(to: string, orderNumber: string, total: number) {
  if (!process.env.SMTP_HOST) return; // skip if not configured
  const from = await getSiteEmail();
  const transport = createTransport();
  const formattedTotal = total.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });

  await transport.sendMail({
    from: `MesoPro <${from}>`,
    to,
    subject: `Siparişiniz Alındı — #${orderNumber}`,
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #18181b;">
        <h2 style="color: #4f46e5;">Siparişiniz alındı!</h2>
        <p>Merhaba,</p>
        <p>
          <strong>#${orderNumber}</strong> numaralı siparişiniz başarıyla alındı.
          En kısa sürede hazırlanarak kargo sürecine alınacaktır.
        </p>
        <p><strong>Toplam:</strong> ${formattedTotal}</p>
        <p>Siparişinizi takip etmek için hesabınızdaki sipariş geçmişine göz atabilirsiniz.</p>
        <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 24px 0;" />
        <p style="font-size: 12px; color: #a1a1aa;">MesoPro — Mezoterapi Ürünleri</p>
      </div>
    `,
  });
}

export async function sendTicketReply(to: string, ticketNumber: string, subject: string) {
  if (!process.env.SMTP_HOST) return;
  const from = await getSiteEmail();
  const transport = createTransport();

  await transport.sendMail({
    from: `MesoPro Destek <${from}>`,
    to,
    subject: `Destek talebinize yanıt — ${ticketNumber}`,
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #18181b;">
        <h2 style="color: #4f46e5;">Destek talebinize yanıt verildi</h2>
        <p>Merhaba,</p>
        <p>
          <strong>${ticketNumber}</strong> numaralı destek talebinize yeni bir yanıt geldi.
        </p>
        <p><strong>Konu:</strong> ${subject}</p>
        <p>Yanıtı görmek ve yanıtlamak için hesabınızdaki destek bölümünü ziyaret edin.</p>
        <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 24px 0;" />
        <p style="font-size: 12px; color: #a1a1aa;">MesoPro — Mezoterapi Ürünleri</p>
      </div>
    `,
  });
}

export async function sendContactAutoReply(to: string, name: string) {
  if (!process.env.SMTP_HOST) return;
  const from = await getSiteEmail();
  const transport = createTransport();

  await transport.sendMail({
    from: `MesoPro <${from}>`,
    to,
    subject: "Mesajınız alındı — MesoPro",
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #18181b;">
        <h2 style="color: #4f46e5;">Mesajınızı aldık</h2>
        <p>Merhaba ${name},</p>
        <p>Mesajınız bize ulaştı. En kısa sürede size geri döneceğiz.</p>
        <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 24px 0;" />
        <p style="font-size: 12px; color: #a1a1aa;">MesoPro — Mezoterapi Ürünleri</p>
      </div>
    `,
  });
}

export async function sendPasswordReset(to: string, token: string) {
  if (!process.env.SMTP_HOST) return;
  const from = await getSiteEmail();
  const transport = createTransport();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  await transport.sendMail({
    from: `MesoPro <${from}>`,
    to,
    subject: "Şifre Sıfırlama — MesoPro",
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #18181b;">
        <h2 style="color: #4f46e5;">Şifrenizi sıfırlayın</h2>
        <p>Hesabınız için şifre sıfırlama talebinde bulundunuz.</p>
        <p>Aşağıdaki bağlantıya tıklayarak yeni şifrenizi belirleyebilirsiniz:</p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="background: #4f46e5; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Şifremi Sıfırla
          </a>
        </p>
        <p style="color: #71717a; font-size: 13px;">Bu bağlantı 1 saat geçerlidir. Eğer bu talebi siz yapmadıysanız bu e-postayı yok sayabilirsiniz.</p>
        <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 24px 0;" />
        <p style="font-size: 12px; color: #a1a1aa;">MesoPro — Mezoterapi Ürünleri</p>
      </div>
    `,
  });
}

export async function sendWelcome(to: string, name: string) {
  if (!process.env.SMTP_HOST) return;
  const from = await getSiteEmail();
  const transport = createTransport();

  await transport.sendMail({
    from: `MesoPro <${from}>`,
    to,
    subject: "Hoş geldiniz — MesoPro",
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #18181b;">
        <h2 style="color: #4f46e5;">Hoş geldiniz, ${name}!</h2>
        <p>MesoPro ailesine katıldığınız için teşekkür ederiz.</p>
        <p>Artık tüm ürünlerimize göz atabilir, sipariş oluşturabilir ve siparişlerinizi takip edebilirsiniz.</p>
        <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 24px 0;" />
        <p style="font-size: 12px; color: #a1a1aa;">MesoPro — Mezoterapi Ürünleri</p>
      </div>
    `,
  });
}

export async function sendOrderStatusUpdate(to: string, orderNumber: string, status: string) {
  if (!process.env.SMTP_HOST) return;
  const from = await getSiteEmail();
  const transport = createTransport();
  const statusLabels: Record<string, string> = {
    pending: "Beklemede",
    confirmed: "Onaylandı",
    processing: "Hazırlanıyor",
    shipped: "Kargoya Verildi",
    delivered: "Teslim Edildi",
    cancelled: "İptal Edildi",
  };
  const statusLabel = statusLabels[status] ?? status;

  await transport.sendMail({
    from: `MesoPro <${from}>`,
    to,
    subject: `Sipariş Durumu Güncellendi — #${orderNumber}`,
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #18181b;">
        <h2 style="color: #4f46e5;">Sipariş durumunuz değişti</h2>
        <p><strong>#${orderNumber}</strong> numaralı siparişinizin durumu güncellendi.</p>
        <p>Yeni durum: <strong>${statusLabel}</strong></p>
        <p>Siparişinizi takip etmek için hesabınızdaki sipariş geçmişine göz atabilirsiniz.</p>
        <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 24px 0;" />
        <p style="font-size: 12px; color: #a1a1aa;">MesoPro — Mezoterapi Ürünleri</p>
      </div>
    `,
  });
}

export async function sendLowStockAlert(adminEmail: string, productName: string, currentStock: number) {
  if (!process.env.SMTP_HOST) return;
  const from = await getSiteEmail();
  const transport = createTransport();

  await transport.sendMail({
    from: `MesoPro Sistem <${from}>`,
    to: adminEmail,
    subject: `Düşük Stok Uyarısı — ${productName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #18181b;">
        <h2 style="color: #d97706;">⚠️ Düşük Stok Uyarısı</h2>
        <p><strong>${productName}</strong> ürününün stok seviyesi kritik eşiğin altına düştü.</p>
        <p>Mevcut stok: <strong>${currentStock} adet</strong></p>
        <p>Admin panelinden stok güncellemenizi öneririz.</p>
        <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 24px 0;" />
        <p style="font-size: 12px; color: #a1a1aa;">MesoPro — Otomatik Sistem Bildirimi</p>
      </div>
    `,
  });
}
