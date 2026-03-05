import { NextResponse } from "next/server";
import { generateSyllabus } from "@/lib/ai";
import { validateTopic } from "@/lib/moderation";
import { saveCourse } from "@/lib/store";
import { sseEvent } from "@/lib/stream";
import type { ExperienceLevel, GenerateCourseRequest } from "@/types/models";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as GenerateCourseRequest | null;
  const topic = body?.topic?.trim() ?? "";
  const experienceLevel: ExperienceLevel = body?.experienceLevel ?? "beginner";
  const validationError = validateTopic(topic);

  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        controller.enqueue(sseEvent("status", { message: "Generating syllabus structure…" }));
        const course = await generateSyllabus({ topic, experienceLevel });
        saveCourse(course);

        controller.enqueue(
          sseEvent("outline", {
            chapters: course.chapters.map((chapter) => `${String(chapter.order).padStart(2, "0")} ${chapter.title}`),
          }),
        );
        controller.enqueue(sseEvent("status", { message: "Syllabus ready. Opening your course…" }));
        controller.enqueue(sseEvent("done", { courseId: course.id }));
      } catch (error) {
        controller.enqueue(
          sseEvent("error", {
            message: error instanceof Error ? error.message : "Could not generate this course right now.",
          }),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
      "Cache-Control": "no-cache",
    },
  });
}
