"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/server/authOptions";
import { createSubject, updateSubject, deleteSubject } from "@/server/store";
import { revalidatePath } from "next/cache";

export async function createSubjectAction(formData: FormData) {
  const session = await getServerSession(authOptions as any);
  const uid = (session as any)?.user?.id as string | undefined;
  if (!uid) return;

  const slug = String(formData.get("slug") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();

  if (!slug || !title) return;

  try {
    await createSubject({
      slug,
      title,
      description: description || null,
      active: true,
    });
  } catch {
    // ignoruj chyby typu duplicitní slug atd.
  }

  revalidatePath("/admin/subjects");
}

export async function updateSubjectAction(formData: FormData) {
  const session = await getServerSession(authOptions as any);
  const uid = (session as any)?.user?.id as string | undefined;
  if (!uid) return;

  const id = String(formData.get("id") || "").trim();
  if (!id) return;

  const title = formData.get("title");
  const description = formData.get("description");
  const activeRaw = formData.get("active");

  const patch: any = {};
  if (title !== null) patch.title = String(title).trim();
  if (description !== null)
    patch.description = String(description).trim() || null;
  if (activeRaw !== null) patch.active = activeRaw === "on";

  if (Object.keys(patch).length === 0) return;

  await updateSubject(id, patch);
  revalidatePath("/admin/subjects");
}

export async function deleteSubjectAction(id: string) {
  const session = await getServerSession(authOptions as any);
  const uid = (session as any)?.user?.id as string | undefined;
  if (!uid) return;

  if (!id) return;
  await deleteSubject(id);
  revalidatePath("/admin/subjects");
}

