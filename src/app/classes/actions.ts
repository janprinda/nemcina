"use server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/authOptions";
import { createMessage } from "@/server/store";

export async function sendMessageAction(classId: string, formData: FormData) {
  const session = await getServerSession(authOptions as any);
  const userId = (session as any)?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  const content = String(formData.get("content") || "").trim();
  if (!content) return;

  // Uložit zprávu
  await createMessage(classId, userId, content);

  // Vrátit signál pro refresh (client side)
  return { success: true };
}
