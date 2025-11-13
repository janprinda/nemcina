import { NextResponse } from "next/server";
import { getPublishedLessons } from "@/server/store";
export const dynamic = "force-dynamic";

export async function GET() {
  const lessons = await getPublishedLessons();
  return NextResponse.json(lessons);
}
