import type {
  Chapter,
  ContentBlock,
  Course,
  ExperienceLevel,
  LessonContent,
  Subsection,
} from "@/types/models";

function levelLabel(level: ExperienceLevel): string {
  if (level === "advanced") return "advanced";
  if (level === "intermediate") return "intermediate";
  return "beginner-friendly";
}

const chapterPatterns = [
  "Foundations and Mental Models",
  "Core Building Blocks",
  "First Practical Applications",
  "Design Patterns and Trade-offs",
  "Tools, Workflow, and Best Practices",
  "Common Mistakes and How to Avoid Them",
  "Intermediate Techniques",
  "Real-World Case Studies",
  "Performance and Optimization",
  "Advanced Concepts",
  "Project Planning and Execution",
  "Mastery Roadmap",
];

function buildSubsections(
  chapterId: string,
  topic: string,
  chapterTitle: string,
  chapterOrder: number,
): Subsection[] {
  return [
    {
      id: crypto.randomUUID(),
      chapterId,
      order: 1,
      title: `${topic}: ${chapterTitle.split(" ")[0]} essentials`,
      estimatedMinutes: 12,
    },
    {
      id: crypto.randomUUID(),
      chapterId,
      order: 2,
      title: `Worked example: applying ${chapterTitle.toLowerCase()}`,
      estimatedMinutes: 14,
    },
    {
      id: crypto.randomUUID(),
      chapterId,
      order: 3,
      title: `Common pitfalls in chapter ${chapterOrder}`,
      estimatedMinutes: 10,
    },
  ];
}

export function buildMockCourse(topic: string, level: ExperienceLevel = "beginner"): Course {
  const now = new Date().toISOString();
  const title = `${topic.trim()} — Complete Learning Path`;
  const chapters: Chapter[] = chapterPatterns.slice(0, 10).map((label, index) => {
    const chapterId = crypto.randomUUID();
    return {
      id: chapterId,
      courseId: "",
      order: index + 1,
      title: `${index + 1}. ${label}`,
      description: `A ${levelLabel(level)} chapter focused on ${label.toLowerCase()} for ${topic}.`,
      estimatedMinutes: 36,
      subsections: buildSubsections(chapterId, topic, label, index + 1),
    };
  });

  const courseId = crypto.randomUUID();
  const normalizedChapters = chapters.map((chapter) => ({
    ...chapter,
    courseId,
  }));
  return {
    id: courseId,
    userId: "anonymous",
    topic: topic.trim(),
    title,
    description: `A structured, ${levelLabel(level)} curriculum to build confidence in ${topic} chapter by chapter.`,
    estimatedMinutes: normalizedChapters.reduce((sum, chapter) => sum + chapter.estimatedMinutes, 0),
    chapters: normalizedChapters,
    createdAt: now,
    updatedAt: now,
    status: "ready",
  };
}

export function buildMockLesson(topic: string, subsectionTitle: string, level: ExperienceLevel): LessonContent {
  const prose = `When learning **${topic}**, this section on **${subsectionTitle}** matters because it turns abstract ideas into practical intuition. For a ${levelLabel(level)} learner, the fastest path is: understand the concept, connect it to a familiar analogy, then apply it in a small repeatable workflow.`;

  const blocks: ContentBlock[] = [
    {
      type: "prose",
      text: `${prose}\n\nThink of this as learning to drive: reading signs is useful, but true progress comes from short practice loops with immediate feedback.`,
    },
    {
      type: "callout",
      title: "Key concept",
      variant: "key-concept",
      text: `${subsectionTitle} is most useful when you can explain *why* it works, not just *what* it does.`,
    },
    {
      type: "example",
      text: `Imagine you are teaching ${topic} to a friend in five minutes. Start with one simple rule, one real-world use case, and one "do this first" checklist. That's the same structure used in this lesson.`,
    },
    {
      type: "quiz",
      question: `What is the best first step when applying ${subsectionTitle}?`,
      options: [
        "Memorize every advanced term first",
        "Start with a clear mental model and a small practice task",
        "Skip examples and move straight to final projects",
        "Only focus on tools, not concepts",
      ],
      correctIndex: 1,
      explanation:
        "A clear model plus a small practical step creates fast feedback and builds confidence quickly.",
    },
    {
      type: "summary",
      text: `You now have a practical lens for **${subsectionTitle}**. Next, reinforce it by applying the idea once in a tiny project and reflecting on what changed in your understanding.`,
    },
  ];

  return { blocks };
}
