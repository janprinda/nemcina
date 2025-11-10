"use server";
import { revalidatePath } from "next/cache";
import { addEntry as storeAdd, removeEntry as storeRemove, updateLesson as storeUpdateLesson } from "@/server/store";
import { redirect } from "next/navigation";

export async function addEntry(lessonId: string, formData: FormData) {
  const term = String(formData.get("term") || "").trim();
  const translation = String(formData.get("translation") || "").trim();
  const type = (String(formData.get("type") || "WORD").toUpperCase()) as "WORD" | "PHRASE";
  const partOfSpeech = String(formData.get("pos") || "").trim() || null;
  const gendersRaw = String(formData.get("genders") || "").trim();
  const genders = gendersRaw ? gendersRaw.split(",").map(s=>s.trim()).filter(s=> ["der","die","das"].includes(s)) as ("der"|"die"|"das")[] : null;
  const explanation = String(formData.get("explanation") || "").trim() || null;
  if (!term || !translation) return { error: "Vyplň obě pole" };
  await storeAdd(lessonId, { term, translation, type, partOfSpeech, genders, explanation });
  revalidatePath(`/admin/lessons/${lessonId}`);
  redirect(`/admin/lessons/${lessonId}`);
}

export async function deleteEntry(lessonId: string, id: string) {
  await storeRemove(id);
  revalidatePath(`/admin/lessons/${lessonId}`);
}

export async function updateLessonAction(lessonId: string, formData: FormData) {
  const title = String(formData.get('title') || '').trim();
  const description = String(formData.get('description') || '').trim();
  await storeUpdateLesson(lessonId, { title: title || undefined, description: description || undefined });
  revalidatePath(`/admin/lessons/${lessonId}`);
  redirect(`/admin/lessons/${lessonId}`);
}
