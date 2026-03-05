import { clsx, type ClassValue } from "clsx";
import type { Chapter, Course, Subsection, UserProgress } from "@/types/models";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `~${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (remainder === 0) return `~${hours} hr`;
  return `~${hours} hr ${remainder} min`;
}

export function getSubsectionByOrder(
  course: Course,
  chapterOrder: number,
  subsectionOrder: number,
): { chapter: Chapter; subsection: Subsection } | null {
  const chapter = course.chapters.find((item) => item.order === chapterOrder);
  if (!chapter) return null;

  const subsection = chapter.subsections.find((item) => item.order === subsectionOrder);
  if (!subsection) return null;

  return { chapter, subsection };
}

export function getOverallProgress(course: Course, progress: UserProgress[]): number {
  const allSubsections = course.chapters.flatMap((chapter) => chapter.subsections);
  if (allSubsections.length === 0) return 0;

  const completedIds = new Set(
    progress.filter((entry) => entry.completed).map((entry) => entry.subsectionId),
  );
  return Math.round((completedIds.size / allSubsections.length) * 100);
}

export function getChapterProgress(chapter: Chapter, progress: UserProgress[]): number {
  if (chapter.subsections.length === 0) return 0;
  const completedIds = new Set(
    progress.filter((entry) => entry.completed).map((entry) => entry.subsectionId),
  );
  const done = chapter.subsections.filter((subsection) => completedIds.has(subsection.id)).length;
  return Math.round((done / chapter.subsections.length) * 100);
}
