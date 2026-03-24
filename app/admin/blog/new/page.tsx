import BlogForm from "../BlogForm";

export default function NewBlogPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Yeni Blog Yazısı</h1>
      <BlogForm />
    </div>
  );
}
