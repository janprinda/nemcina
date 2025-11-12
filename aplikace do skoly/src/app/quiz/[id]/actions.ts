"use server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/authOptions";
import { getEntryById, recordAttempt } from "@/server/store";

type SubmitResult = { correct: boolean; expected: string; expectedGenders: ("der"|"die"|"das")[] | null; genderCorrect: boolean; textCorrect: boolean };

export async function submitAnswer(entryId: string, answer: string, dir?: 'de2cs' | 'cs2de', chosenGender?: 'der'|'die'|'das'|null): Promise<SubmitResult> {
  const session = await getServerSession(authOptions as any);
  const userId = (session as any)?.user?.id as string | undefined;
  const entry = await getEntryById(entryId);
  if (!entry) return { correct: false, expected: '', expectedGenders: null, genderCorrect: false, textCorrect: false };
  const expected = dir === 'cs2de' ? entry.term : entry.translation;
  const expectedVariants = (dir === 'cs2de')
    ? [expected]
    : expected.split(/[;,/|]/).map(s=>s.trim()).filter(Boolean);
  const normAns = normalize(answer);
  const textCorrect = expectedVariants.map(normalize).some(v => v === normAns);
  let genderCorrect = true;
  const eg = (entry as any).genders as ("der"|"die"|"das")[] | undefined;
  if (entry.partOfSpeech === 'noun' && eg && eg.length) {
    genderCorrect = chosenGender ? eg.includes(chosenGender) : false;
  }
  const correct = textCorrect && genderCorrect;
  await recordAttempt({ userId, entryId, answer, correct });
  return { correct, expected, expectedGenders: eg ?? null, genderCorrect, textCorrect };
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



