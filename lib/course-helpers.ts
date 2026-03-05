import type { Course, Subsection } from "@/types/models";

export function flattenSubsections(course: Course): Subsection[] {
  return course.chapters.flatMap((chapter) => chapter.subsections);
}

export function findSubsection(course: Course, subsectionId: string): Subsection | undefined {
  return flattenSubsections(course).find((subsection) => subsection.id === subsectionId);
}

export function getAdjacentSubsections(
  course: Course,
  subsectionId: string,
): { previous?: Subsection; next?: Subsection } {
  const flattened = flattenSubsections(course);
  const index = flattened.findIndex((subsection) => subsection.id === subsectionId);
  if (index < 0) return {};
  return {
    previous: flattened[index - 1],
    next: flattened[index + 1],
  };
}
