import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

export type Role = "USER" | "ADMIN" | "TEACHER";
export type User = { id: string; name?: string | null; displayName?: string | null; nickname?: string | null; email?: string | null; role: Role; passwordHash?: string | null; birthDate?: string | null; interests?: string[] | null; phone?: string | null; desiredClassCode?: string | null; avatarUrl?: string | null };

export type TeacherCode = { id: string; code: string; note?: string | null; activated: boolean; activatedAt?: string | null; activatedBy?: string | null; createdAt: string };
export type Lesson = { id: string; title: string; description?: string | null; createdAt: string };
export type Entry = {
  id: string;
  lessonId: string;
  term: string;
  translation: string;
  type: "WORD" | "PHRASE";
  partOfSpeech?: string | null;
  genders?: ("der" | "die" | "das")[] | null;
  explanation?: string | null;
  createdAt: string;
};
export type Attempt = { id: string; userId?: string | null; entryId: string; answer: string; correct: boolean; createdAt: string };

export type Account = {
  id: string;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  access_token?: string | null;
  refresh_token?: string | null;
  expires_at?: number | null;
  token_type?: string | null;
  scope?: string | null;
  id_token?: string | null;
};

export type Session = {
  id: string;
  sessionToken: string;
  userId: string;
  expires: string; // ISO date
};

export type VerificationToken = {
  identifier: string;
  token: string;
  expires: string; // ISO date
};

type DB = {
  users: User[];
  lessons: Lesson[];
  entries: Entry[];
  attempts: Attempt[];
  accounts?: Account[];
  sessions?: Session[];
  verificationTokens?: VerificationToken[];
  teacherCodes?: TeacherCode[];
};

const dataDir = path.join(process.cwd(), "data");
const dbFile = path.join(dataDir, "db.json");

async function ensure() {
  await fs.mkdir(dataDir, { recursive: true });
  try { await fs.access(dbFile); } catch {
    const empty: DB = { users: [], lessons: [], entries: [], attempts: [], accounts: [], sessions: [], verificationTokens: [], teacherCodes: [] };
    await fs.writeFile(dbFile, JSON.stringify(empty, null, 2), "utf8");
  }
}

async function read(): Promise<DB> { await ensure(); const raw = await fs.readFile(dbFile, "utf8"); return JSON.parse(raw); }
async function write(db: DB) { await fs.writeFile(dbFile, JSON.stringify(db, null, 2), "utf8"); }

const id = () => crypto.randomUUID();

export async function getLessons(): Promise<Lesson[]> { const db = await read(); return db.lessons.sort((a,b)=> (a.createdAt < b.createdAt ? 1 : -1)); }
export async function getLesson(idv: string) { const db = await read(); return db.lessons.find(l => l.id === idv) || null; }
export async function createLesson(data: { title: string; description?: string | null }) {
  const db = await read();
  const l: Lesson = { id: id(), title: data.title, description: data.description ?? null, createdAt: new Date().toISOString() };
  db.lessons.push(l); await write(db); return l;
}
export async function deleteLesson(lessonId: string) { const db = await read(); db.entries = db.entries.filter(e=> e.lessonId !== lessonId); db.lessons = db.lessons.filter(l=> l.id!==lessonId); await write(db); }
export async function updateLesson(lessonId: string, data: Partial<Pick<Lesson,'title'|'description'>>) {
  const db = await read();
  const idx = db.lessons.findIndex(l => l.id === lessonId);
  if (idx === -1) return null;
  db.lessons[idx] = { ...db.lessons[idx], ...data };
  await write(db);
  return db.lessons[idx];
}

export async function getEntries(lessonId: string) { const db = await read(); return db.entries.filter(e=> e.lessonId === lessonId).sort((a,b)=> (a.createdAt < b.createdAt ? 1 : -1)); }
export async function getEntryById(entryId: string) { const db = await read(); return db.entries.find(e => e.id === entryId) || null; }
export async function addEntry(
  lessonId: string,
  data: { term: string; translation: string; type: "WORD"|"PHRASE"; partOfSpeech?: string | null; genders?: ("der"|"die"|"das")[] | null; explanation?: string | null }
) {
  const db = await read();
  const e: Entry = {
    id: id(),
    lessonId,
    term: data.term,
    translation: data.translation,
    type: data.type,
    partOfSpeech: data.partOfSpeech ?? null,
    genders: data.genders ?? null,
    explanation: data.explanation ?? null,
    createdAt: new Date().toISOString(),
  };
  db.entries.push(e); await write(db); return e;
}
export async function removeEntry(entryId: string) { const db = await read(); db.entries = db.entries.filter(e=> e.id!==entryId); await write(db); }
export async function updateEntry(entryId: string, data: Partial<Pick<Entry, 'term'|'translation'|'type'|'partOfSpeech'|'genders'|'explanation'>>) {
  const db = await read();
  const idx = db.entries.findIndex(e => e.id === entryId);
  if (idx === -1) return null;
  db.entries[idx] = { ...db.entries[idx], ...data };
  await write(db);
  return db.entries[idx];
}

export async function recordAttempt(data: { userId?: string | null; entryId: string; answer: string; correct: boolean }) {
  const db = await read(); const a: Attempt = { id: id(), ...data, createdAt: new Date().toISOString() } as Attempt; db.attempts.push(a); await write(db); return a;
}

export async function findUserByEmail(email: string) { const db = await read(); return db.users.find(u => (u.email||"").toLowerCase() === email.toLowerCase()) || null; }
export async function getUserById(uid: string) { const db = await read(); return db.users.find(u => u.id === uid) || null; }
export async function upsertAdmin(email: string, name: string, passwordHash: string) {
  const db = await read();
  const existing = db.users.find(u => (u.email||"").toLowerCase() === email.toLowerCase());
  if (existing) { existing.role = "ADMIN"; existing.passwordHash = passwordHash; await write(db); return existing; }
  const u: User = { id: id(), name, email, role: "ADMIN", passwordHash };
  db.users.push(u); await write(db); return u;
}
export async function getUsers() { const db = await read(); return db.users.slice(); }
export async function getAttempts() { const db = await read(); return db.attempts.slice(); }
export async function updateUserName(userId: string, name: string) { const db = await read(); const u = db.users.find(x=>x.id===userId); if (!u) return null; u.name = name; await write(db); return u; }
export async function updateUser(userId: string, patch: Partial<User>) { const db = await read(); const u = db.users.find(x=>x.id===userId); if (!u) return null; Object.assign(u, patch); await write(db); return u; }

// Teacher codes
export async function listTeacherCodes() { const db = await read(); db.teacherCodes ||= []; return db.teacherCodes; }
export async function createTeacherCodes(count: number) {
  const db = await read(); db.teacherCodes ||= [];
  const make = () => Math.random().toString(36).slice(2, 8).toUpperCase();
  const out: TeacherCode[] = [];
  for (let i=0;i<count;i++) { const code = make(); const tc: TeacherCode = { id: id(), code, activated: false, createdAt: new Date().toISOString() }; db.teacherCodes.push(tc); out.push(tc); }
  await write(db); return out;
}
export async function updateTeacherCodeNote(idv: string, note: string) { const db = await read(); const t = (db.teacherCodes ||= []).find(c=>c.id===idv); if (!t) return null; t.note = note; await write(db); return t; }
export async function deleteTeacherCode(idv: string) { const db = await read(); db.teacherCodes = (db.teacherCodes ||= []).filter(c=>c.id!==idv); await write(db); }
export async function activateTeacherCodeIfValid(input: string, userId: string) {
  const db = await read(); const t = (db.teacherCodes ||= []).find(c=>c.code === input && !c.activated);
  if (!t) return false; t.activated = true; t.activatedAt = new Date().toISOString(); t.activatedBy = userId; await write(db); return true;
}
