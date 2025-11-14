"use server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/authOptions";
import { getEntryById, recordAttempt } from "@/server/store";

type SubmitResult = {
  correct: boolean;
  expected: string;
  expectedGenders: ("der" | "die" | "das")[] | null;
  genderCorrect: boolean;
  textCorrect: boolean;
  points: number;
};

export async function submitAnswer(
  entryId: string,
  answer: string,
  dir: "de2cs" | "cs2de",
  chosenGender: "der" | "die" | "das" | null,
  mode: "mc" | "write"
): Promise<SubmitResult> {
  const session = await getServerSession(authOptions as any);
  const userId = (session as any)?.user?.id as string | undefined;
  const entry = await getEntryById(entryId);
  if (!entry)
    return {
      correct: false,
      expected: "",
      expectedGenders: null,
      genderCorrect: false,
      textCorrect: false,
      points: 0,
    };

  const expected = dir === "cs2de" ? entry.term : entry.translation;
  const expectedVariants =
    dir === "cs2de"
      ? [expected]
      : expected.split(/[;,/|]/).map((s) => s.trim()).filter(Boolean);
  const normAns = normalize(answer);
  const textCorrect = expectedVariants.map(normalize).some(v => v === normAns);
  let genderCorrect = true;
  const eg = (entry as any).genders as ("der" | "die" | "das")[] | undefined;
  if (entry.partOfSpeech === "noun" && eg && eg.length) {
    genderCorrect = chosenGender ? eg.includes(chosenGender) : false;
  }
  const correct = textCorrect && genderCorrect;

  // bodování
  let points = 0;
  if (mode === "mc") {
    if (dir === "de2cs") {
      // rozhodovačka DE -> CS
      points = correct ? 18 : -1;
    } else {
      // rozhodovačka CS -> DE
      if (textCorrect && genderCorrect) points = 21;
      else if (textCorrect && !genderCorrect) points = 10;
      else points = -2;
    }
  } else {
    // mode === "write"
    if (dir === "de2cs") {
      // psaní DE -> CS
      points = textCorrect ? 35 : 0;
    } else {
      // psaní CS -> DE
      if (textCorrect && genderCorrect) points = 40;
      else if (textCorrect && !genderCorrect) points = 20;
      else points = 0;
    }
  }

  await recordAttempt({
    userId,
    entryId,
    answer,
    correct,
    points,
    mode,
    dir,
  });

  return {
    correct,
    expected,
    expectedGenders: eg ?? null,
    genderCorrect,
    textCorrect,
    points,
  };
}

function normalize(s: string) {
  return s
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // diakritika
    .replace(/Ăź/g, 'ss')
    .replace(/\s+/g, ' ');
}



