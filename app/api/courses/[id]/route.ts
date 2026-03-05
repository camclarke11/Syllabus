import { NextResponse } from "next/server";
import { deleteCourse, getCourseById } from "@/lib/store";

type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: RouteProps) {
  const { id } = await params;
  const course = getCourseById(id);
  if (!course) {
    return NextResponse.json({ error: "Course not found." }, { status: 404 });
  }
  return NextResponse.json(course);
}

export async function DELETE(_: Request, { params }: RouteProps) {
  const { id } = await params;
  const removed = deleteCourse(id);
  if (!removed) {
    return NextResponse.json({ error: "Course not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
