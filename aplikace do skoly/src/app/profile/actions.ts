"use server";
import { revalidatePath } from "next/cache";
import { updateUserName } from "@/server/store";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export async function updateNameAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return redirect("/auth");
  const name = String(formData.get("name") || "").trim().slice(0, 40);
  await updateUserName(session.user.id as string, name);
  revalidatePath("/profile");
  redirect("/profile");
}

