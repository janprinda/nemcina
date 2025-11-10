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
  const gendersRaw = String(formData.get("genders") || "").trim();
  const genders = gendersRaw ? gendersRaw.split(",").map(s=>s.trim()).filter(s=> ["der","die","das"].includes(s)) as ("der"|"die"|"das")[] : null;
  if (!term || !translation) return { error: "Vyplň obě pole" };
  await storeUpdate(entryId, { term, translation, type, partOfSpeech, explanation, genders });
  revalidatePath(`/admin/lessons/${lessonId}`);
  redirect(`/admin/lessons/${lessonId}`);
}

export async function deleteEntryAction(lessonId: string, entryId: string) {
  await storeRemove(entryId);
  revalidatePath(`/admin/lessons/${lessonId}`);
  redirect(`/admin/lessons/${lessonId}`);
}
