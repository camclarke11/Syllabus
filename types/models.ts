export type ExperienceLevel = "beginner" | "intermediate" | "advanced";

export interface Course {
  id: string;
  userId: string;
  topic: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  chapters: Chapter[];
  createdAt: string;
  updatedAt: string;
  status: "generating" | "ready" | "error";
}

export interface Chapter {
  id: string;
  courseId: string;
  order: number;
  title: string;
  description: string;
  estimatedMinutes: number;
  subsections: Subsection[];
}

export interface Subsection {
  id: string;
  chapterId: string;
  order: number;
  title: string;
  content?: LessonContent;
  estimatedMinutes: number;
}

export interface LessonContent {
  blocks: ContentBlock[];
}

export type ContentBlock =
  | { type: "prose"; text: string }
  | {
      type: "callout";
      title: string;
      text: string;
      variant: "definition" | "warning" | "tip" | "key-concept";
    }
  | { type: "example"; text: string }
  | { type: "code"; language: string; code: string; caption?: string }
  | {
      type: "quiz";
      question: string;
      options: string[];
      correctIndex: number;
      explanation: string;
    }
  | { type: "summary"; text: string }
  | { type: "image"; prompt: string; alt: string };

export interface UserProgress {
  userId: string;
  courseId: string;
  subsectionId: string;
  completed: boolean;
  completedAt?: string;
  scrollPosition?: number;
}

export interface GenerateCourseRequest {
  topic: string;
  experienceLevel?: ExperienceLevel;
}

export interface GenerateContentRequest {
  subsectionId?: string;
  chapterOrder?: number;
  subsectionOrder?: number;
  experienceLevel?: ExperienceLevel;
}
