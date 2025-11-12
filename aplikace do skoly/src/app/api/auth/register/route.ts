import { NextResponse } from "next/server";
import { findUserByEmail, activateTeacherCodeIfValid } from "@/server/store";
import { promises as fs } from "fs";
import path from "path";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null) as any;
  const name = String(body?.name || "").trim().slice(0, 60);
  const email = String(body?.email || "").trim().toLowerCase();
  const password = String(body?.password || "");
  const birthDate = String(body?.birthDate || "").trim() || null; // YYYY-MM-DD
  const phoneCode = String(body?.phoneCode || "").trim();
  const phoneNumber = String(body?.phoneNumber || "").trim();
  const phone = (phoneCode && phoneNumber) ? `${phoneCode} ${phoneNumber}` : null;
  const roleReq = String(body?.role || "").toUpperCase();
  const teacherCode = String(body?.teacherCode || "").trim();
  const joinClass = Boolean(body?.joinClass);
  const classCode = String(body?.classCode || "").trim();
  const interests = Array.isArray(body?.interests)
    ? (body.interests as string[]).map(s => String(s).trim()).filter(Boolean).slice(0, 20)
    : String(body?.interests || '').split(',').map(s => s.trim()).filter(Boolean).slice(0, 20);

  const emailOk = /.+@.+\..+/.test(email);
  const passUpperOk = /[A-Z]/.test(password);
  const passNumOk = /\d/.test(password);
  if (!emailOk || !password || password.length < 8 || !passUpperOk || !passNumOk) {
    return NextResponse.json({ error: 'Neplatná data' }, { status: 400 });
  }

  const exists = await findUserByEmail(email);
  if (exists) return NextResponse.json({ error: 'Uživatel již existuje' }, { status: 400 });

  const dbPath = path.join(process.cwd(), 'data', 'db.json');
  await fs.mkdir(path.dirname(dbPath), { recursive: true });
  const raw = await fs.readFile(dbPath, 'utf8').catch(() => JSON.stringify({ users: [], lessons: [], entries: [], attempts: [] }));
  const db = JSON.parse(raw);
  const id = cryptoRandomId();
  const passwordHash = await bcrypt.hash(password, 10);
  let role: 'USER' | 'TEACHER' = 'USER';
  if (roleReq === 'TEACHER') {
    const ok = teacherCode ? await activateTeacherCodeIfValid(teacherCode, id) : false;
    if (!ok) return NextResponse.json({ error: 'Neplatný nebo použitý ověřovací kód učitele' }, { status: 400 });
    role = 'TEACHER';
  }
  db.users ||= [];
  db.users.push({
    id,
    name: name || null,
    email,
    role,
    passwordHash,
    birthDate,
    interests: interests.length ? interests : null,
    phone,
    desiredClassCode: (role === 'TEACHER' ? null : (joinClass && classCode ? classCode : null))
  });
  await fs.writeFile(dbPath, JSON.stringify(db, null, 2), 'utf8');
  return NextResponse.json({ ok: true });
}

function cryptoRandomId() {
  return (globalThis.crypto?.randomUUID?.() || (Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2))).slice(0, 24);
}

