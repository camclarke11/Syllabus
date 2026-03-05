import { NextResponse } from "next/server";
import { getAllCoursesByUser, getProgress } from "@/lib/store";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId") ?? "anonymous";
  const courses = getAllCoursesByUser(userId);

  const payload = courses.map((course) => {
    const progress = getProgress(course.id, userId);
    const completedIds = new Set(progress.filter((item) => item.completed).map((item) => item.subsectionId));
    const totalSubsections = course.chapters.flatMap((chapter) => chapter.subsections).length;
    const completion = totalSubsections ? Math.round((completedIds.size / totalSubsections) * 100) : 0;
    return {
      id: course.id,
      title: course.title,
      topic: course.topic,
      updatedAt: course.updatedAt,
      estimatedMinutes: course.estimatedMinutes,
      completion,
    };
  });

  return NextResponse.json({ courses: payload });
}
