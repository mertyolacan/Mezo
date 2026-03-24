import ProfileSidebar from "./ProfileSidebar";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        <ProfileSidebar />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
