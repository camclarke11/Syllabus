"use client";

type ProgressState = {
  completedSubsections: Record<string, boolean>;
  scrollPositions: Record<string, number>;
};

const PREFIX = "syllabus-progress";

function key(courseId: string) {
  return `${PREFIX}:${courseId}`;
}

export function readLocalProgress(courseId: string): ProgressState {
  if (typeof window === "undefined") {
    return { completedSubsections: {}, scrollPositions: {} };
  }

  const raw = window.localStorage.getItem(key(courseId));
  if (!raw) return { completedSubsections: {}, scrollPositions: {} };

  try {
    const parsed = JSON.parse(raw) as ProgressState;
    return {
      completedSubsections: parsed.completedSubsections ?? {},
      scrollPositions: parsed.scrollPositions ?? {},
    };
  } catch {
    return { completedSubsections: {}, scrollPositions: {} };
  }
}

export function setSubsectionCompleted(courseId: string, subsectionId: string, completed = true): ProgressState {
  const state = readLocalProgress(courseId);
  const next: ProgressState = {
    ...state,
    completedSubsections: {
      ...state.completedSubsections,
      [subsectionId]: completed,
    },
  };
  window.localStorage.setItem(key(courseId), JSON.stringify(next));
  return next;
}

export function setScrollPosition(courseId: string, subsectionId: string, scrollPosition: number): ProgressState {
  const state = readLocalProgress(courseId);
  const next: ProgressState = {
    ...state,
    scrollPositions: {
      ...state.scrollPositions,
      [subsectionId]: scrollPosition,
    },
  };
  window.localStorage.setItem(key(courseId), JSON.stringify(next));
  return next;
}
