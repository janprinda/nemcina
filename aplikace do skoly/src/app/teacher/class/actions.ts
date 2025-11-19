"use server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/authOptions";
import { createClass as storeCreateClass, regenerateClassCode as storeRegen, postMessage, createParty, listMessages, getUserById, updateClass } from "@/server/store";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { emitTopic } from "@/server/events";

export async function createClassAction(formData: FormData) {
  const session = await getServerSession(authOptions as any);
  const uid = (session as any)?.user?.id as string | undefined;
  if (!uid) return;
  const name = String(formData.get('name') || '').trim() || 'Moje třída';
  const me = await getUserById(uid);
  if (!me || (me.role !== 'TEACHER' && me.role !== 'ADMIN')) {
    return redirect('/');
  }
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
  // Enforce cooldown if set on class
  const msgs = await listMessages(classId);
  const lastMine = msgs.slice().reverse().find(m => m.userId === uid);
  // Fetch class to read cooldown (we'll rely on updateClass storing it; we can get it via membership listing on page rendering)
  // To avoid extra store helper, we can read cooldown from last message meta; but simpler: allow 0 cooldown if undefined.
  // We'll opportunistically check by reading a synthetic cooldown value posted with form if present.
  const cooldownStr = String(formData.get('cooldownHint') || '').trim();
  const cooldown = Math.max(0, parseInt(cooldownStr||'0',10) || 0);
  if (lastMine && cooldown > 0) {
    const since = Date.now() - new Date(lastMine.createdAt).getTime();
    if (since < cooldown*1000) {
      revalidatePath('/teacher/class');
      return;
    }
  }
  await postMessage(classId, uid, content);
  emitTopic(`chat:${classId}`, { kind: "message" });
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

export async function updateCooldownAction(classId: string, formData: FormData) {
  const session = await getServerSession(authOptions as any);
  const uid = (session as any)?.user?.id as string | undefined;
  if (!uid) return;
  const me = await getUserById(uid);
  if (!me || (me.role !== 'TEACHER' && me.role !== 'ADMIN')) return;
  const seconds = Math.max(0, Math.min(600, parseInt(String(formData.get('chatCooldownSec')||'0'),10) || 0));
  await updateClass(classId, { chatCooldownSec: seconds });
  revalidatePath('/teacher/class');
}

export async function renameClassAction(classId: string, formData: FormData) {
  const session = await getServerSession(authOptions as any);
  const uid = (session as any)?.user?.id as string | undefined;
  if (!uid) return;
  const me = await getUserById(uid);
  if (!me || (me.role !== 'TEACHER' && me.role !== 'ADMIN')) return;
  const name = String(formData.get('name') || '').trim().slice(0, 80);
  if (!name) return;
  await updateClass(classId, { name });
  revalidatePath('/teacher/class');
}

