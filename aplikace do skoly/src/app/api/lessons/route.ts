import { NextResponse } from "next/server";
import { getPublishedLessons } from "@/server/store";

export async function GET() {
  const lessons = await getPublishedLessons();
  return NextResponse.json(lessons);
}
