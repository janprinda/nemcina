"use server";
import { createTeacherCodes, deleteTeacherCode, listTeacherCodes, updateTeacherCodeNote } from "@/server/store";
import { revalidatePath } from "next/cache";
import { deleteTeacherCode as delCode } from "@/server/store";

export async function generateAction(formData: FormData) {
  const count = parseInt(String(formData.get('count')||'1'), 10) || 1;
  await createTeacherCodes(Math.min(Math.max(count,1), 50));
  revalidatePath('/admin/teacher-codes');
}

export async function updateNoteAction(id: string, formData: FormData) {
  const note = String(formData.get('note')||'');
  await updateTeacherCodeNote(id, note);
  revalidatePath('/admin/teacher-codes');
}

export async function deleteCodeAction(id: string) {
  await deleteTeacherCode(id);
  revalidatePath('/admin/teacher-codes');
}

export async function deleteCodesAction(formData: FormData) {
  const ids = formData.getAll('ids').map(String).filter(Boolean);
  for (const id of ids) { await delCode(id); }
  revalidatePath('/admin/teacher-codes');
}
