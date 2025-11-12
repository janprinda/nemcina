"use server";
import { revalidatePath } from "next/cache";
import { updateUser } from "@/server/store";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/authOptions";
import { redirect } from "next/navigation";

export async function updateProfileAction(formData: FormData) {
  const session = await getServerSession(authOptions as any);
  const userId = (session as any)?.user?.id as string | undefined;
  if (!userId) return redirect("/auth");
  const name = String(formData.get("name") || "").trim().slice(0, 60) || null;
  const displayName = String(formData.get("displayName") || "").trim().slice(0, 60) || null;
  const nickname = String(formData.get("nickname") || "").trim().slice(0, 40) || null;
  const birthDate = String(formData.get("birthDate") || "").trim() || null;
  const phoneCode = String(formData.get("phoneCode") || "").trim();
  const phoneNumber = String(formData.get("phoneNumber") || "").trim();
  const phone = phoneCode && phoneNumber ? `${phoneCode} ${phoneNumber}` : null;
  const interests = String(formData.get("interests") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  // handle avatar file if provided
  const file = formData.get('avatar') as unknown as File | null;
  let avatarUrl: string | null | undefined = undefined;
  if (file && typeof (file as any).arrayBuffer === 'function' && (file as any).size > 0) {
    const { promises: fs } = await import('fs');
    const path = (await import('path')).default;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const ext = (file.name?.split('.').pop() || 'png').toLowerCase();
    const uploads = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploads, { recursive: true });
    const filename = `${userId}-${Date.now()}.${ext}`;
    const filepath = path.join(uploads, filename);
    await fs.writeFile(filepath, buffer);
    avatarUrl = `/uploads/${filename}`;
  }

  await updateUser(userId, {
    name,
    displayName,
    nickname,
    birthDate,
    phone,
    interests: interests.length ? interests : null,
    ...(avatarUrl ? { avatarUrl } : {}),
  });
  revalidatePath("/profile");
  redirect("/profile");
}
