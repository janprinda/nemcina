import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/authOptions";
import { nextPartyQuestion, startParty } from "@/server/store";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions as any);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(()=>null) as any;
  const partyId = String(body?.partyId||'');
  const action = String(body?.action||'next');
  const p = action === 'start' ? await startParty(partyId) : await nextPartyQuestion(partyId);
  return NextResponse.json({ ok: true, party: p });
}

