import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/authOptions";
import { createParty } from "@/server/store";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions as any);
  const userId = (session as any)?.user?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(()=>null) as any;
  const classId = String(body?.classId||'');
  const lessonId = String(body?.lessonId||'');
  const mode = (String(body?.mode||'mc') === 'write' ? 'write' : 'mc') as 'mc'|'write';
  const timerSec = Math.max(5, Math.min(120, parseInt(String(body?.timerSec||'30'),10)||30));
  const p = await createParty({ classId, lessonId, mode, timerSec, createdBy: userId });
  return NextResponse.json({ ok: true, party: p });
}

