import Anthropic from "@anthropic-ai/sdk";
import { buildMockCourse, buildMockLesson } from "@/lib/mock-generators";
import { lessonContentSchema, syllabusSchema } from "@/lib/schema";
import type { Course, ExperienceLevel, LessonContent } from "@/types/models";

type SyllabusInput = {
  topic: string;
  experienceLevel: ExperienceLevel;
};

type LessonInput = {
  topic: string;
  courseTitle: string;
  chapterTitle: string;
  chapterOrder: number;
  subsectionTitle: string;
  subsectionOrder: number;
  experienceLevel: ExperienceLevel;
  previousTitle?: string;
  nextTitle?: string;
  outlineJson: string;
};

function tryExtractJson(raw: string): unknown {
  const trimmed = raw.trim();
  const fencedMatch = trimmed.match(/```json\s*([\s\S]*?)```/i);
  const candidate = fencedMatch?.[1] ?? trimmed;

  try {
    return JSON.parse(candidate);
  } catch {
    // Fall through and try object extraction.
  }

  const firstBrace = candidate.indexOf("{");
  const lastBrace = candidate.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return JSON.parse(candidate.slice(firstBrace, lastBrace + 1));
  }

  const firstBracket = candidate.indexOf("[");
  const lastBracket = candidate.lastIndexOf("]");
  if (firstBracket >= 0 && lastBracket > firstBracket) {
    return JSON.parse(candidate.slice(firstBracket, lastBracket + 1));
  }

  throw new Error("Unable to parse JSON from AI response.");
}

function anthropicClient(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  return new Anthropic({ apiKey });
}

export async function generateSyllabus(input: SyllabusInput): Promise<Course> {
  const client = anthropicClient();
  if (!client) return buildMockCourse(input.topic, input.experienceLevel);

  const prompt = `
You are a world-class curriculum designer and educator. A user wants to learn about the following topic:

TOPIC: "${input.topic}"
LEVEL: "${input.experienceLevel}" (beginner | intermediate | advanced)

Generate a comprehensive, well-structured course outline. Return ONLY valid JSON matching this schema:

{
  "title": "string — polished course title",
  "description": "string — 1-2 sentence course summary",
  "estimatedMinutes": number,
  "chapters": [
    {
      "order": number,
      "title": "string — clear, specific chapter title",
      "description": "string — what the learner will understand after this chapter",
      "estimatedMinutes": number,
      "subsections": [
        {
          "order": number,
          "title": "string — specific subsection title",
          "estimatedMinutes": number
        }
      ]
    }
  ]
}
`;

  const model = process.env.ANTHROPIC_MODEL ?? "claude-3-7-sonnet-latest";
  const response = await client.messages.create({
    model,
    max_tokens: 4000,
    temperature: 0.4,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n");
  const parsed = syllabusSchema.parse(tryExtractJson(text));

  const now = new Date().toISOString();
  const courseId = crypto.randomUUID();
  return {
    id: courseId,
    userId: "anonymous",
    topic: input.topic,
    title: parsed.title,
    description: parsed.description,
    estimatedMinutes: parsed.estimatedMinutes,
    chapters: parsed.chapters.map((chapter) => {
      const chapterId = crypto.randomUUID();
      return {
        id: chapterId,
        courseId,
        order: chapter.order,
        title: chapter.title,
        description: chapter.description,
        estimatedMinutes: chapter.estimatedMinutes,
        subsections: chapter.subsections.map((subsection) => ({
          id: crypto.randomUUID(),
          chapterId,
          order: subsection.order,
          title: subsection.title,
          estimatedMinutes: subsection.estimatedMinutes,
        })),
      };
    }),
    createdAt: now,
    updatedAt: now,
    status: "ready",
  };
}

export async function generateLesson(input: LessonInput): Promise<LessonContent> {
  const client = anthropicClient();
  if (!client) return buildMockLesson(input.topic, input.subsectionTitle, input.experienceLevel);

  const prompt = `
You are an expert educator writing a lesson for an online learning platform.

COURSE: "${input.courseTitle}"
CHAPTER ${input.chapterOrder}: "${input.chapterTitle}"
SUBSECTION ${input.subsectionOrder}: "${input.subsectionTitle}"
LEVEL: "${input.experienceLevel}"
PREVIOUS SECTION: "${input.previousTitle ?? "This is the first section"}"
NEXT SECTION: "${input.nextTitle ?? "This is the final section"}"

FULL COURSE OUTLINE (for context, do not repeat content from other sections):
${input.outlineJson}

Write an engaging lesson. Return ONLY valid JSON as an array of content blocks:
[
  { "type": "prose", "text": "Markdown string" },
  { "type": "callout", "title": "string", "text": "string", "variant": "definition|warning|tip|key-concept" },
  { "type": "example", "text": "Markdown string" },
  { "type": "code", "language": "string", "code": "string", "caption": "optional string" },
  { "type": "quiz", "question": "string", "options": ["string"], "correctIndex": number, "explanation": "string" },
  { "type": "summary", "text": "Markdown string" }
]
`;

  const model = process.env.ANTHROPIC_MODEL ?? "claude-3-7-sonnet-latest";
  const response = await client.messages.create({
    model,
    max_tokens: 4000,
    temperature: 0.6,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n");

  const parsedRaw = tryExtractJson(text);
  const parsed = Array.isArray(parsedRaw) ? { blocks: parsedRaw } : parsedRaw;
  return lessonContentSchema.parse(parsed);
}
