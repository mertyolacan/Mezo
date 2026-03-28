import { adminLoginAction } from "@/lib/actions/auth";

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return <AdminLoginForm searchParams={searchParams} />;
}

async function AdminLoginForm({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const errorMessages: Record<string, string> = {
    missing: "E-posta ve şifre gerekli",
    unauthorized: "Admin yetkisi gerekli",
    invalid: "E-posta veya şifre hatalı",
    server: "Sunucu hatası, tekrar deneyin",
  };

  const error = params.error ? (errorMessages[params.error] ?? "Giriş başarısız") : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Meso<span className="text-brand-primary">Pro</span>
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Admin Paneli</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8">
          <form action={adminLoginAction} className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                E-posta
              </label>
              <input
                type="email"
                name="email"
                required
                className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-brand-primary transition"
                placeholder="admin@mesopro.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Şifre
              </label>
              <input
                type="password"
                name="password"
                required
                className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-brand-primary transition"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary-light text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
            >
              Giriş Yap
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
