import { notFound } from "next/navigation";
import { CourseOverview } from "@/components/course-overview";
import { getCourseById } from "@/lib/store";

type RouteProps = {
  params: Promise<{ courseId: string }>;
};

export default async function CourseOverviewPage({ params }: RouteProps) {
  const { courseId } = await params;
  const course = getCourseById(courseId);
  if (!course) {
    notFound();
  }

  return <CourseOverview course={course} />;
}
