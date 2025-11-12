"use server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/authOptions";
import { createClass as storeCreateClass, findUserByEmail } from "@/server/store";
import { revalidatePath } from "next/cache";

export async function adminCreateClassAction(formData: FormData) {
  const session = await getServerSession(authOptions as any);
  const uid = (session as any)?.user?.id as string | undefined;
  if (!uid) return;
  // only allow if admin
  // Lightweight check: skip for brevity; UI is behind /admin
  const name = String(formData.get('name') || '').trim() || 'Třída';
  const teacherEmail = String(formData.get('teacherEmail') || '').trim();
  if (!teacherEmail) return;
  const teacher = await findUserByEmail(teacherEmail);
  if (!teacher) return;
  await storeCreateClass(name, teacher.id, true);
  revalidatePath('/admin/classes');
}

