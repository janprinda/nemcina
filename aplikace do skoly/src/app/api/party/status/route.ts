import { NextResponse } from "next/server";
import { getPartyState, getActivePartyForClass } from "@/server/store";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const partyId = searchParams.get('partyId');
  const classId = searchParams.get('classId');
  let state = null;
  if (partyId) {
    state = await getPartyState(partyId);
  } else if (classId) {
    const p = await getActivePartyForClass(classId);
    state = p ? await getPartyState(p.id) : null;
  }
  return NextResponse.json({ state });
}

