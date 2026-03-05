import { notFound } from "next/navigation";
import { LessonView } from "@/components/lesson-view";
import { getCourseById } from "@/lib/store";

type RouteProps = {
  params: Promise<{ courseId: string; chapterOrder: string; subsectionOrder: string }>;
};

export default async function LessonPage({ params }: RouteProps) {
  const { courseId, chapterOrder, subsectionOrder } = await params;
  const course = getCourseById(courseId);
  if (!course) notFound();

  const chapter = course.chapters.find((item) => item.order === Number(chapterOrder));
  if (!chapter) notFound();

  const subsection = chapter.subsections.find((item) => item.order === Number(subsectionOrder));
  if (!subsection) notFound();

  const flat = course.chapters.flatMap((item) =>
    item.subsections.map((sub) => ({
      subsection: sub,
      chapterOrder: item.order,
    })),
  );
  const index = flat.findIndex((item) => item.subsection.id === subsection.id);
  const previous = index > 0 ? flat[index - 1] : undefined;
  const next = index >= 0 && index < flat.length - 1 ? flat[index + 1] : undefined;

  const prefetchSubsectionIds = flat.slice(index + 1, index + 3).map((item) => item.subsection.id);

  return (
    <LessonView
      courseId={course.id}
      chapterOrder={chapter.order}
      subsectionOrder={subsection.order}
      subsectionId={subsection.id}
      chapterTitle={chapter.title}
      subsectionTitle={subsection.title}
      initialContent={subsection.content}
      previousHref={
        previous
          ? `/course/${course.id}/${previous.chapterOrder}/${previous.subsection.order}`
          : undefined
      }
      nextHref={next ? `/course/${course.id}/${next.chapterOrder}/${next.subsection.order}` : undefined}
      prefetchSubsectionIds={prefetchSubsectionIds}
    />
  );
}
