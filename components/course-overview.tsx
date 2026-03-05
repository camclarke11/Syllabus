"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Circle, Lock, PlayCircle } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { readLocalProgress } from "@/lib/local-progress";
import { cn, formatMinutes } from "@/lib/utils";
import type { Course } from "@/types/models";

type Props = {
  course: Course;
};

export function CourseOverview({ course }: Props) {
  const [completedBySubsection] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};
    return readLocalProgress(course.id).completedSubsections;
  });
  const [openChapter, setOpenChapter] = useState<number>(course.chapters[0]?.order ?? 1);

  const chapterProgress = useMemo(() => {
    return course.chapters.map((chapter) => {
      const done = chapter.subsections.filter((item) => completedBySubsection[item.id]).length;
      return {
        chapterOrder: chapter.order,
        percent: Math.round((done / chapter.subsections.length) * 100),
        done,
      };
    });
  }, [completedBySubsection, course.chapters]);

  const totalSubsections = course.chapters.flatMap((chapter) => chapter.subsections).length;
  const totalCompleted = Object.values(completedBySubsection).filter(Boolean).length;
  const totalPercent = totalSubsections ? Math.round((totalCompleted / totalSubsections) * 100) : 0;

  const continueTarget = useMemo(() => {
    for (const chapter of course.chapters) {
      for (const subsection of chapter.subsections) {
        if (!completedBySubsection[subsection.id]) {
          return `/course/${course.id}/${chapter.order}/${subsection.order}`;
        }
      }
    }
    const lastChapter = course.chapters.at(-1);
    const lastSubsection = lastChapter?.subsections.at(-1);
    if (!lastChapter || !lastSubsection) return "/";
    return `/course/${course.id}/${lastChapter.order}/${lastSubsection.order}`;
  }, [completedBySubsection, course.chapters, course.id]);

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-5 py-10 sm:px-10">
      <section className="mb-8 border-y border-white/10 py-7">
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-stone-400">Personalised course</p>
        <h1 className="font-[var(--font-heading)] text-4xl leading-tight text-stone-100">{course.title}</h1>
        <p className="mt-4 max-w-2xl text-stone-300">{course.description}</p>
        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-stone-300">
          <span>{course.chapters.length} chapters</span>
          <span>•</span>
          <span>{formatMinutes(course.estimatedMinutes)}</span>
          <span>•</span>
          <span className="text-amber-300">{totalPercent}% complete</span>
        </div>
      </section>

      <section className="space-y-3">
        {course.chapters.map((chapter) => {
          const prev = chapterProgress.find((item) => item.chapterOrder === chapter.order - 1);
          const isLocked = chapter.order > 1 && (prev?.percent ?? 0) < 100;
          const progress = chapterProgress.find((item) => item.chapterOrder === chapter.order)?.percent ?? 0;
          const isOpen = openChapter === chapter.order;

          return (
            <article key={chapter.id} className="rounded-xl border border-white/10 bg-white/[0.03]">
              <button
                type="button"
                onClick={() => !isLocked && setOpenChapter((current) => (current === chapter.order ? -1 : chapter.order))}
                className={cn(
                  "flex w-full items-center justify-between gap-2 px-4 py-4 text-left",
                  isLocked && "cursor-not-allowed opacity-70",
                )}
              >
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-stone-500">
                    {String(chapter.order).padStart(2, "0")}
                  </p>
                  <h2 className="mt-1 text-lg text-stone-100">{chapter.title}</h2>
                </div>
                <div className="flex items-center gap-3 text-sm text-stone-300">
                  {isLocked ? (
                    <>
                      <Lock size={15} />
                      <span>Locked</span>
                    </>
                  ) : (
                    <>
                      <span>{progress}%</span>
                      {progress === 100 ? <CheckCircle2 size={16} className="text-emerald-300" /> : <Circle size={16} />}
                    </>
                  )}
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && !isLocked && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-white/10 px-4 py-3">
                      <p className="mb-3 text-sm text-stone-400">{chapter.description}</p>
                      <ul className="space-y-2">
                        {chapter.subsections.map((subsection) => {
                          const done = !!completedBySubsection[subsection.id];
                          return (
                            <li key={subsection.id}>
                              <Link
                                href={`/course/${course.id}/${chapter.order}/${subsection.order}`}
                                className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2 text-sm transition hover:border-amber-300/50"
                              >
                                <span>
                                  {chapter.order}.{subsection.order} {subsection.title}
                                </span>
                                {done ? <CheckCircle2 size={15} className="text-emerald-300" /> : <Circle size={15} />}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </article>
          );
        })}
      </section>

      <div className="sticky bottom-4 mt-8">
        <Link
          href={continueTarget}
          className="mx-auto flex w-full max-w-sm items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-3 text-sm font-semibold text-neutral-900 hover:bg-amber-300"
        >
          <PlayCircle size={16} />
          Continue learning
        </Link>
      </div>
    </main>
  );
}
