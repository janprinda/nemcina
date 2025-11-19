"use server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/authOptions";
import { joinClassByCode, postMessage } from "@/server/store";
import { revalidatePath } from "next/cache";
import { emitTopic } from "@/server/events";

export async function joinByCodeAction(formData: FormData) {
  const session = await getServerSession(authOptions as any);
  const uid = (session as any)?.user?.id as string | undefined;
  if (!uid) return;
  const code = String(formData.get('code') || '').trim();
  if (!code) return;
  await joinClassByCode(uid, code);
  revalidatePath('/classes');
}

export async function sendMessageAction(classId: string, formData: FormData) {
  const session = await getServerSession(authOptions as any);
  const uid = (session as any)?.user?.id as string | undefined;
  if (!uid) return;
  const content = String(formData.get('content') || '').trim();
  if (!content) return;
  await postMessage(classId, uid, content);
  emitTopic(`chat:${classId}`, { kind: "message" });
  revalidatePath('/classes');
}
