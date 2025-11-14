"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { updateEntry as storeUpdate, removeEntry as storeRemove } from "@/server/store";

export async function updateEntryAction(lessonId: string, entryId: string, formData: FormData) {
  const term = String(formData.get("term") || "").trim();
  const translation = String(formData.get("translation") || "").trim();
  const type = (String(formData.get("type") || "WORD").toUpperCase()) as "WORD" | "PHRASE";
  const partOfSpeech = String(formData.get("pos") || "").trim() || null;
  const explanation = String(formData.get("explanation") || "").trim() || null;
  const termSynonymsArr = formData
    .getAll("termSynonyms")
    .map((v) => String(v || "").trim())
    .filter(Boolean);
  const translationSynonymsArr = formData
    .getAll("translationSynonyms")
    .map((v) => String(v || "").trim())
    .filter(Boolean);
  const termSynonyms = termSynonymsArr.length ? termSynonymsArr : null;
  const translationSynonyms = translationSynonymsArr.length
    ? translationSynonymsArr
    : null;
  const pluralInput = String(formData.get("plural") || "").trim();
  const plural =
    pluralInput.length > 0
      ? pluralInput.startsWith("-")
        ? pluralInput
        : "-" + pluralInput
      : null;
  const verbClassRaw = String(formData.get("verbClass") || "").trim();
  const verbClass =
    verbClassRaw === "regular" || verbClassRaw === "irregular"
      ? (verbClassRaw as "regular" | "irregular")
      : null;
  const gendersRaw = String(formData.get("genders") || "").trim();
  const genders = gendersRaw
    ? (gendersRaw.split(",").map((s) => s.trim()).filter((s) => ["der", "die", "das"].includes(s)) as ("der" | "die" | "das")[])
    : null;
  const pointsCorrectEnabled = formData.get("pointsCorrectEnabled") === "on";
  const pointsPartialEnabled = formData.get("pointsPartialEnabled") === "on";
  const pointsWrongEnabled = formData.get("pointsWrongEnabled") === "on";
  const pointsCorrectRaw = String(formData.get("pointsCorrect") || "").trim();
  const pointsPartialRaw = String(formData.get("pointsPartial") || "").trim();
  const pointsWrongRaw = String(formData.get("pointsWrong") || "").trim();
  const parsePoints = (enabled: boolean, raw: string) => {
    if (!enabled) return null;
    if (!raw) return null;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) ? n : null;
  };
  const pointsCorrect = parsePoints(pointsCorrectEnabled, pointsCorrectRaw);
  const pointsPartial = parsePoints(pointsPartialEnabled, pointsPartialRaw);
  const pointsWrong = parsePoints(pointsWrongEnabled, pointsWrongRaw);
  if (!term || !translation) {
    revalidatePath(`/admin/lessons/${lessonId}/entries/${entryId}`);
    redirect(`/admin/lessons/${lessonId}/entries/${entryId}`);
  }
  await storeUpdate(entryId, {
    term,
    translation,
    type,
    partOfSpeech,
    explanation,
    genders,
    termSynonyms,
    translationSynonyms,
    plural,
    verbClass,
    pointsCorrect,
    pointsPartial,
    pointsWrong,
  });
  revalidatePath(`/admin/lessons/${lessonId}`);
  redirect(`/admin/lessons/${lessonId}`);
}

export async function deleteEntryAction(lessonId: string, entryId: string) {
  await storeRemove(entryId);
  revalidatePath(`/admin/lessons/${lessonId}`);
  redirect(`/admin/lessons/${lessonId}`);
}
