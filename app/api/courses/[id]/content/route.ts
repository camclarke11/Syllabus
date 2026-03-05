import { NextResponse } from "next/server";
import { generateLesson } from "@/lib/ai";
import { getAdjacentSubsections } from "@/lib/course-helpers";
import { getCourseById, saveSubsectionContent } from "@/lib/store";
import { sseEvent } from "@/lib/stream";
import type { ExperienceLevel, GenerateContentRequest } from "@/types/models";

type RouteProps = {
  params: Promise<{ id: string }>;
};

function resolveSubsection(requestBody: GenerateContentRequest, subsectionIds: Set<string>) {
  if (requestBody.subsectionId) {
    return subsectionIds.has(requestBody.subsectionId) ? requestBody.subsectionId : undefined;
  }
  return undefined;
}

export async function POST(request: Request, { params }: RouteProps) {
  const { id } = await params;
  const body = (await request.json().catch(() => null)) as GenerateContentRequest | null;
  const course = getCourseById(id);
  if (!course) {
    return NextResponse.json({ error: "Course not found." }, { status: 404 });
  }

  const allSubsections = course.chapters.flatMap((chapter) => chapter.subsections);
  const subsectionId = resolveSubsection(
    body ?? {},
    new Set(allSubsections.map((subsection) => subsection.id)),
  );
  let subsection = subsectionId ? allSubsections.find((item) => item.id === subsectionId) : undefined;

  if (!subsection && typeof body?.chapterOrder === "number" && typeof body?.subsectionOrder === "number") {
    const chapter = course.chapters.find((item) => item.order === body.chapterOrder);
    subsection = chapter?.subsections.find((item) => item.order === body.subsectionOrder);
  }

  if (!subsection) {
    return NextResponse.json({ error: "Subsection not found." }, { status: 404 });
  }

  if (subsection.content) {
    return NextResponse.json({ subsectionId: subsection.id, content: subsection.content, cached: true });
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        controller.enqueue(sseEvent("status", { message: "Drafting lesson content…" }));
        const chapter = course.chapters.find((item) => item.id === subsection?.chapterId);
        if (!chapter) throw new Error("Chapter not found.");

        const adjacent = getAdjacentSubsections(course, subsection.id);
        const outlineJson = JSON.stringify(
          {
            chapters: course.chapters.map((item) => ({
              order: item.order,
              title: item.title,
              subsections: item.subsections.map((sub) => ({ order: sub.order, title: sub.title })),
            })),
          },
          null,
          2,
        );

        const content = await generateLesson({
          topic: course.topic,
          courseTitle: course.title,
          chapterTitle: chapter.title,
          chapterOrder: chapter.order,
          subsectionTitle: subsection.title,
          subsectionOrder: subsection.order,
          experienceLevel: (body?.experienceLevel ?? "beginner") as ExperienceLevel,
          previousTitle: adjacent.previous?.title,
          nextTitle: adjacent.next?.title,
          outlineJson,
        });

        saveSubsectionContent(course.id, subsection.id, content);
        controller.enqueue(sseEvent("done", { subsectionId: subsection.id, content }));
      } catch (error) {
        controller.enqueue(
          sseEvent("error", {
            message: error instanceof Error ? error.message : "Could not generate lesson content.",
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
