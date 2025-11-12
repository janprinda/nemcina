import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/authOptions";
import { submitPartyAnswer } from "@/server/store";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions as any);
  const userId = (session as any)?.user?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(()=>null) as any;
  const partyId = String(body?.partyId||'');
  const entryId = String(body?.entryId||'');
  const dir = (String(body?.dir||'de2cs') === 'cs2de' ? 'cs2de' : 'de2cs') as 'de2cs'|'cs2de';
  const answer = String(body?.answer||'');
  const chosenGender = body?.chosenGender ? String(body.chosenGender) as any : null;
  const r = await submitPartyAnswer({ partyId, userId, entryId, dir, answer, chosenGender });
  return NextResponse.json({ ok: true, result: r });
}

