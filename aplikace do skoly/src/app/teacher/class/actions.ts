"use server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/authOptions";
import { createClass as storeCreateClass, regenerateClassCode as storeRegen, postMessage, createParty } from "@/server/store";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createClassAction(formData: FormData) {
  const session = await getServerSession(authOptions as any);
  const uid = (session as any)?.user?.id as string | undefined;
  if (!uid) return;
  const name = String(formData.get('name') || '').trim() || 'Moje třída';
  try { await storeCreateClass(name, uid, false); } catch {}
  revalidatePath('/teacher/class');
  // After creating, go back to homepage as requested
  redirect('/');
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

export async function startPartyAction(classId: string, formData: FormData) {
  const session = await getServerSession(authOptions as any);
  const userId = (session as any)?.user?.id as string | undefined;
  if (!userId) return;
  const lessonId = String(formData.get('lessonId') || '').trim();
  const modeRaw = String(formData.get('mode') || 'mc');
  const mode = (modeRaw === 'write' ? 'write' : 'mc') as 'mc'|'write';
  const timerSec = Math.max(5, Math.min(120, parseInt(String(formData.get('timerSec')||'30'),10) || 30));
  try {
    await createParty({ classId, lessonId, mode, timerSec, createdBy: userId });
  } catch {}
  revalidatePath('/teacher/class');
}

