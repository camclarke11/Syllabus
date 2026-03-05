import { NextResponse } from "next/server";
import { getSubsectionContent } from "@/lib/store";

type RouteProps = {
  params: Promise<{ id: string; subsectionId: string }>;
};

export async function GET(_: Request, { params }: RouteProps) {
  const { id, subsectionId } = await params;
  const content = getSubsectionContent(id, subsectionId);
  if (!content) {
    return NextResponse.json({ error: "Content not generated yet." }, { status: 404 });
  }
  return NextResponse.json({ subsectionId, content, cached: true });
}
