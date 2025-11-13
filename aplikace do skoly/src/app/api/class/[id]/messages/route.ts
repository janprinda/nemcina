import { NextResponse } from "next/server";
import { listMessages } from "@/server/store";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const msgs = await listMessages(params.id);
  return NextResponse.json(msgs);
}

