import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center">
        <p className="text-xs uppercase tracking-[0.16em] text-stone-500">404</p>
        <h1 className="mt-2 font-[var(--font-heading)] text-3xl text-stone-100">Course not found</h1>
        <p className="mt-3 text-sm text-stone-400">
          This course might have expired from in-memory storage. Generate a fresh one from the landing page.
        </p>
        <Link href="/" className="mt-5 inline-block text-amber-300 hover:text-amber-200">
          Back to home →
        </Link>
      </div>
    </main>
  );
}
