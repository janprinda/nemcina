"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createLesson as storeCreate, deleteLesson as storeDelete } from "@/server/store";
import { z } from "zod";

const lessonSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
});

export async function createLesson(formData: FormData) {
  const data = Object.fromEntries(formData) as any;
  const parsed = lessonSchema.safeParse({
    title: data.title,
    description: data.description,
  });
  if (!parsed.success) return { error: "Neplatná data" };
  await storeCreate(parsed.data);
  revalidatePath("/admin/lessons");
  redirect("/admin/lessons");
}

export async function deleteLesson(id: string) {
  await storeDelete(id);
  revalidatePath("/admin/lessons");
  redirect("/admin/lessons");
}
