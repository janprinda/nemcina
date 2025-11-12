import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/authOptions";
import { joinParty, getUserById } from "@/server/store";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions as any);
  const userId = (session as any)?.user?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(()=>null) as any;
  const partyId = String(body?.partyId||'');
  const user = await getUserById(userId);
  const displayName = user?.displayName || user?.name || user?.email || 'Uživatel';
  const pl = await joinParty(partyId, userId, displayName);
  return NextResponse.json({ ok: true, player: pl });
}

