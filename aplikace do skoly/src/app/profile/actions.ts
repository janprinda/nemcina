"use server";
import { revalidatePath } from "next/cache";
import { getUserById, updateUser } from "@/server/store";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/authOptions";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

export async function updateProfileAction(formData: FormData) {
  const session = await getServerSession(authOptions as any);
  const userId = (session as any)?.user?.id as string | undefined;
  if (!userId) return redirect("/auth");

  const name = str(formData.get("name")).slice(0, 60) || null;
  const displayName = str(formData.get("displayName")).slice(0, 60) || null;
  const nickname = str(formData.get("nickname")).slice(0, 40) || null;
  const birthDate = str(formData.get("birthDate")) || null;
  const phoneCode = str(formData.get("phoneCode"));
  const phoneNumber = str(formData.get("phoneNumber"));
  const phone = phoneCode && phoneNumber ? `${phoneCode} ${phoneNumber}` : null;
  const interestsRaw = str(formData.get("interests"));
  const interestsArr = interestsRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  // avatar upload
  const file = formData.get("avatar") as unknown as File | null;
  let avatarUrl: string | undefined;
  if (file && typeof (file as any).arrayBuffer === "function" && (file as any).size > 0) {
    const { promises: fs } = await import("fs");
    const path = (await import("path")).default;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const ext = (file.name?.split(".").pop() || "png").toLowerCase();
    const uploads = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploads, { recursive: true });
    const filename = `${userId}-${Date.now()}.${ext}`;
    const filepath = path.join(uploads, filename);
    await fs.writeFile(filepath, buffer);
    avatarUrl = `/uploads/${filename}`;
  }

  // optional password change
  const currentPassword = str(formData.get("currentPassword"));
  const newPassword = str(formData.get("newPassword"));
  const newPasswordConfirm = str(formData.get("newPasswordConfirm"));
  let passwordHashPatch: string | undefined;
  if (currentPassword || newPassword || newPasswordConfirm) {
    const user = await getUserById(userId);
    if (user?.passwordHash) {
      const okCurrent = await bcrypt.compare(currentPassword, user.passwordHash);
      const lenOk = newPassword.length >= 8;
      const upperOk = /[A-Z]/.test(newPassword);
      const numOk = /\d/.test(newPassword);
      if (okCurrent && newPassword && newPassword === newPasswordConfirm && lenOk && upperOk && numOk) {
        passwordHashPatch = await bcrypt.hash(newPassword, 10);
      }
    }
  }

  await updateUser(userId, {
    name,
    displayName,
    nickname,
    birthDate,
    phone,
    interests: interestsArr.length ? interestsArr : null,
    ...(avatarUrl ? { avatarUrl } : {}),
    ...(passwordHashPatch ? { passwordHash: passwordHashPatch } : {}),
  });

  revalidatePath("/profile");
  redirect("/profile");
}

function str(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v.trim() : "";
}

