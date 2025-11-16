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

  if (!entry) {
    return {
      correct: false,
      expected: "",
      expectedGenders: null,
      genderCorrect: false,
      textCorrect: false,
      points: 0,
    };
  }

  const isNoun = entry.partOfSpeech === "noun";
  const expected = dir === "cs2de" ? entry.term : entry.translation;

  const termSynonyms = ((entry as any).termSynonyms as string[] | null) || [];
  const translationSynonyms =
    ((entry as any).translationSynonyms as string[] | null) || [];

  const expectedVariants =
    dir === "cs2de"
      ? [expected, ...termSynonyms]
      : [expected, ...translationSynonyms].flatMap((t) =>
          t
            .split(/[;,/|]/)
            .map((s) => s.trim())
            .filter(Boolean)
        );

  const normAns = normalize(answer);
  const textCorrect = expectedVariants.map(normalize).some((v) => v === normAns);

  let genderCorrect = true;
  const eg = (entry as any).genders as ("der" | "die" | "das")[] | undefined;

  // Rod se kontroluje jen pro směr CS -> DE u podstatných jmen
  if (dir === "cs2de" && isNoun && eg && eg.length) {
    genderCorrect = chosenGender ? eg.includes(chosenGender) : false;
  }

  const correct = textCorrect && genderCorrect;

  // entry-specific scoring (pokud je nastaveno)
  const pc = entry.pointsCorrect;
  const pp = entry.pointsPartial;
  const pw = entry.pointsWrong;
  const hasCustom =
    typeof pc === "number" || typeof pp === "number" || typeof pw === "number";

  let points = 0;

  if (hasCustom) {
    if (textCorrect && genderCorrect) {
      points = pc ?? 0;
    } else if (textCorrect && !genderCorrect) {
      if (typeof pp === "number") {
        points = pp;
      } else if (typeof pc === "number") {
        // fallback: polovina bodů za správně
        points = Math.round(pc / 2);
      } else {
        points = 0;
      }
    } else {
      points = pw ?? 0;
    }
  } else {
    // globální bodování podle režimu a směru
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
  }

  // multiplier pro psaní odpovědí
  if (mode === "write") {
    points = Math.round(points * 1.6);
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
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ƫ/g, "ss")
    .replace(/\s+/g, " ");
}

