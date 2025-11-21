import { NextResponse } from "next/server";
import { getPublishedLessons } from "@/server/store";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const subject = searchParams.get("subject");

  const lessons = await getPublishedLessons();

  // Pokud není specifikovaný předmět nebo je to Němčina, vracíme všechny publikované lekce (současný stav)
  if (!subject || subject === "nemcina") {
    return NextResponse.json(lessons);
  }

  // Pro ostatní předměty zatím neukazujeme žádné lekce, aby se nesdílela slovíčka z Němčiny
  return NextResponse.json([]);
}
