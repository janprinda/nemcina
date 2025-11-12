"use server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/authOptions";
import { createClass as storeCreateClass, regenerateClassCode as storeRegen, postMessage, listMessages } from "@/server/store";
import { revalidatePath } from "next/cache";

export async function createClassAction(formData: FormData) {
  const session = await getServerSession(authOptions as any);
  const uid = (session as any)?.user?.id as string | undefined;
  if (!uid) return;
  const name = String(formData.get('name') || '').trim() || 'Moje třída';
  try { await storeCreateClass(name, uid, false); } catch {}
  revalidatePath('/teacher/class');
}

export async function regenerateCodeAction(classId: string) {
  await storeRegen(classId);
  revalidatePath('/teacher/class');
}

export async function sendClassMessageAction(classId: string, formData: FormData) {
  const session = await getServerSession(authOptions as any);
  const uid = (session as any)?.user?.id as string | undefined;
  if (!uid) return;
  const content = String(formData.get('content') || '').trim();
  if (!content) return;
  await postMessage(classId, uid, content);
  revalidatePath('/teacher/class');
}

