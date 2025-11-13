import { NextResponse } from "next/server";
import { getLessons } from "@/server/store";

export async function GET() {
  const lessons = await getLessons();
  return NextResponse.json(lessons);
}

