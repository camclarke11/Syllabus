import Link from "next/link";
import { getAllCoursesByUser, getProgress } from "@/lib/store";
import { formatMinutes } from "@/lib/utils";

export default function DashboardPage() {
  const courses = getAllCoursesByUser("anonymous");

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-5 py-10 sm:px-10">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.16em] text-stone-400">Dashboard</p>
        <h1 className="mt-2 font-[var(--font-heading)] text-4xl text-stone-100">My Courses</h1>
      </header>

      {courses.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 text-stone-300">
          <p className="mb-2">No courses yet.</p>
          <Link href="/" className="text-amber-300 hover:text-amber-200">
            Generate your first course →
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {courses.map((course) => {
            const totalSubsections = course.chapters.flatMap((chapter) => chapter.subsections).length;
            const completed = new Set(
              getProgress(course.id, "anonymous")
                .filter((entry) => entry.completed)
                .map((entry) => entry.subsectionId),
            );
            const completion = totalSubsections ? Math.round((completed.size / totalSubsections) * 100) : 0;
            return (
              <Link
                href={`/course/${course.id}`}
                key={course.id}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-amber-300/40"
              >
                <p className="text-xs uppercase tracking-[0.14em] text-stone-500">{course.topic}</p>
                <h2 className="mt-1 text-lg text-stone-100">{course.title}</h2>
                <p className="mt-1 text-sm text-stone-400">
                  {formatMinutes(course.estimatedMinutes)} · {completion}% complete
                </p>
                <div className="mt-3 h-1.5 w-full rounded bg-white/10">
                  <div className="h-full rounded bg-amber-400" style={{ width: `${completion}%` }} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
