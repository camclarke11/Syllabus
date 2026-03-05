import type { Course, LessonContent, UserProgress } from "@/types/models";

type Store = {
  courses: Map<string, Course>;
  progressByCourse: Map<string, UserProgress[]>;
};

declare global {
  var __syllabusStore: Store | undefined;
}

const store: Store =
  globalThis.__syllabusStore ??
  (globalThis.__syllabusStore = {
    courses: new Map<string, Course>(),
    progressByCourse: new Map<string, UserProgress[]>(),
  });

export function saveCourse(course: Course): Course {
  store.courses.set(course.id, course);
  return course;
}

export function getCourseById(courseId: string): Course | undefined {
  return store.courses.get(courseId);
}

export function getAllCoursesByUser(userId: string): Course[] {
  return [...store.courses.values()]
    .filter((course) => course.userId === userId)
    .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
}

export function deleteCourse(courseId: string): boolean {
  store.progressByCourse.delete(courseId);
  return store.courses.delete(courseId);
}

export function saveSubsectionContent(
  courseId: string,
  subsectionId: string,
  content: LessonContent,
): Course | undefined {
  const course = store.courses.get(courseId);
  if (!course) return undefined;

  for (const chapter of course.chapters) {
    const subsection = chapter.subsections.find((item) => item.id === subsectionId);
    if (subsection) {
      subsection.content = content;
      course.updatedAt = new Date().toISOString();
      store.courses.set(course.id, course);
      return course;
    }
  }

  return undefined;
}

export function getSubsectionContent(courseId: string, subsectionId: string): LessonContent | undefined {
  const course = store.courses.get(courseId);
  if (!course) return undefined;
  for (const chapter of course.chapters) {
    const subsection = chapter.subsections.find((item) => item.id === subsectionId);
    if (subsection?.content) return subsection.content;
  }
  return undefined;
}

export function updateProgress(entry: UserProgress): UserProgress[] {
  const existing = store.progressByCourse.get(entry.courseId) ?? [];
  const index = existing.findIndex(
    (item) => item.userId === entry.userId && item.subsectionId === entry.subsectionId,
  );
  if (index >= 0) {
    existing[index] = { ...existing[index], ...entry };
  } else {
    existing.push(entry);
  }
  store.progressByCourse.set(entry.courseId, existing);
  return existing;
}

export function getProgress(courseId: string, userId?: string): UserProgress[] {
  const entries = store.progressByCourse.get(courseId) ?? [];
  if (!userId) return entries;
  return entries.filter((item) => item.userId === userId);
}
