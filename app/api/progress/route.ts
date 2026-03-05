import { NextResponse } from "next/server";
import { updateProgress } from "@/lib/store";
import type { UserProgress } from "@/types/models";

export async function PATCH(request: Request) {
  const body = (await request.json().catch(() => null)) as UserProgress | null;
  if (!body?.courseId || !body.subsectionId) {
    return NextResponse.json({ error: "Missing courseId or subsectionId." }, { status: 400 });
  }

  const userId = body.userId || "anonymous";
  const updated = updateProgress({
    userId,
    courseId: body.courseId,
    subsectionId: body.subsectionId,
    completed: body.completed,
    completedAt: body.completed ? new Date().toISOString() : undefined,
    scrollPosition: body.scrollPosition,
  });

  return NextResponse.json({ progress: updated });
}
