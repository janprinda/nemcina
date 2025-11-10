import { NextResponse } from "next/server";
import { getEntries } from "@/server/store";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const data = await getEntries(params.id);
  const entries = data.map(({ id, term, translation, explanation, partOfSpeech, genders }) => ({ id, term, translation, explanation, partOfSpeech, genders }));
  return NextResponse.json(entries);
}
