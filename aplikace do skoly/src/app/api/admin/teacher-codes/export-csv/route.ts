import { listTeacherCodes } from "@/server/store";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

export async function GET() {
  const codes = await listTeacherCodes();
  const rows = [
    ["code","note","activated","activatedAt"],
    ...codes.map(c => [c.code, (c.note||'').replaceAll('"','""'), String(!!c.activated), c.activatedAt || ''])
  ];
  const csv = rows.map(r => r.map(v => /[",\n]/.test(String(v)) ? `"${String(v)}"` : String(v)).join(",")).join("\n");
  return new NextResponse(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="teacher-codes.csv"' } });
}

