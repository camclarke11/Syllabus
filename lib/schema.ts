import { z } from "zod";

export const lessonBlockSchema = z.union([
  z.object({
    type: z.literal("prose"),
    text: z.string().min(1),
  }),
  z.object({
    type: z.literal("callout"),
    title: z.string().min(1),
    text: z.string().min(1),
    variant: z.enum(["definition", "warning", "tip", "key-concept"]),
  }),
  z.object({
    type: z.literal("example"),
    text: z.string().min(1),
  }),
  z.object({
    type: z.literal("code"),
    language: z.string().min(1),
    code: z.string().min(1),
    caption: z.string().optional(),
  }),
  z.object({
    type: z.literal("quiz"),
    question: z.string().min(1),
    options: z.array(z.string().min(1)).min(2),
    correctIndex: z.number().int().min(0),
    explanation: z.string().min(1),
  }),
  z.object({
    type: z.literal("summary"),
    text: z.string().min(1),
  }),
  z.object({
    type: z.literal("image"),
    prompt: z.string().min(1),
    alt: z.string().min(1),
  }),
]);

export const lessonContentSchema = z.object({
  blocks: z.array(lessonBlockSchema).min(3),
});

export const chapterOutlineSchema = z.object({
  order: z.number().int().min(1),
  title: z.string().min(3),
  description: z.string().min(10),
  estimatedMinutes: z.number().int().positive(),
  subsections: z
    .array(
      z.object({
        order: z.number().int().min(1),
        title: z.string().min(3),
        estimatedMinutes: z.number().int().positive(),
      }),
    )
    .min(2),
});

export const syllabusSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  estimatedMinutes: z.number().int().positive(),
  chapters: z.array(chapterOutlineSchema).min(3),
});
