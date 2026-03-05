import Link from "next/link";
import { TopicInput } from "@/components/topic-input";

export default function HomePage() {
  return (
    <main className="min-h-screen px-6 py-10 sm:px-10">
      <div className="mx-auto flex min-h-[85vh] max-w-5xl flex-col items-center justify-center">
        <TopicInput />
        <div className="mt-10 text-center text-sm text-stone-400">
          <p>Linear, immersive lessons generated on demand.</p>
          <Link href="/dashboard" className="mt-2 inline-block text-amber-300 transition hover:text-amber-200">
            View dashboard →
          </Link>
        </div>
      </div>
    </main>
  );
}
