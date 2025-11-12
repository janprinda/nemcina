import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/authOptions";
import { promises as fs } from "fs";
import path from "path";
import { updateUser } from "@/server/store";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions as any);
  const userId = (session as any)?.user?.id as string | undefined;
  if (!userId) return NextResponse.redirect(new URL('/auth', req.url));
  const form = await req.formData();
  const file = form.get('avatar') as File | null;
  if (!file) return NextResponse.redirect(new URL('/profile', req.url));
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const ext = (file.name.split('.').pop() || 'png').toLowerCase();
  const uploads = path.join(process.cwd(), 'public', 'uploads');
  await fs.mkdir(uploads, { recursive: true });
  const filename = `${userId}-${Date.now()}.${ext}`;
  const filepath = path.join(uploads, filename);
  await fs.writeFile(filepath, buffer);
  await updateUser(userId, { avatarUrl: `/uploads/${filename}` });
  return NextResponse.redirect(new URL('/profile', req.url));
}

