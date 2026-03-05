import { NextResponse } from "next/server";
import { getProgress } from "@/lib/store";

type RouteProps = {
  params: Promise<{ courseId: string }>;
};

export async function GET(_: Request, { params }: RouteProps) {
  const { courseId } = await params;
  return NextResponse.json({ progress: getProgress(courseId) });
}
