import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

export type Role = "USER" | "ADMIN" | "TEACHER";
export type User = { id: string; name?: string | null; displayName?: string | null; nickname?: string | null; email?: string | null; role: Role; passwordHash?: string | null; birthDate?: string | null; interests?: string[] | null; phone?: string | null; desiredClassCode?: string | null; avatarUrl?: string | null; rank?: string | null };

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

// Classes and chat
export type ClassRoom = { id: string; name: string; code: string; teacherId: string; createdAt: string; chatCooldownSec?: number };
export type ClassMembership = { id: string; classId: string; userId: string; role: 'STUDENT'|'TEACHER'|'ADMIN' };
export type ChatMessage = { id: string; classId: string; userId: string; content: string; createdAt: string };

// Party (live activity like Kahoot)
export type Party = {
  id: string;
  classId: string;
  lessonId: string;
  mode: 'mc'|'write';
  timerSec: number;
  status: 'lobby'|'running'|'ended';
  createdBy: string;
  createdAt: string;
  entryIds: string[];
  dirs: Array<'de2cs'|'cs2de'>;
  currentIndex: number;
};
export type PartyPlayer = { id: string; partyId: string; userId: string; displayName: string; score: number; joinedAt: string };
export type PartyAnswer = { id: string; partyId: string; userId: string; entryId: string; dir: 'de2cs'|'cs2de'; answer: string; points: number; textCorrect: boolean; genderCorrect: boolean; createdAt: string };

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
  classes?: ClassRoom[];
  classMemberships?: ClassMembership[];
  chatMessages?: ChatMessage[];
  parties?: Party[];
  partyPlayers?: PartyPlayer[];
  partyAnswers?: PartyAnswer[];
};

const dataDir = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(process.cwd(), "data");
const dbFile = path.join(dataDir, "db.json");

function emptyDb(): DB {
  return {
    users: [],
    lessons: [],
    entries: [],
    attempts: [],
    accounts: [],
    sessions: [],
    verificationTokens: [],
    teacherCodes: [],
    classes: [],
    classMemberships: [],
    chatMessages: [],
    parties: [],
    partyPlayers: [],
    partyAnswers: [],
  };
}

async function ensure() {
  await fs.mkdir(dataDir, { recursive: true });
  try { await fs.access(dbFile); } catch {
    const empty = emptyDb();
    await writeRaw(JSON.stringify(empty, null, 2));
  }
}

async function writeRaw(contents: string) {
  const tmp = dbFile + ".tmp";
  await fs.writeFile(tmp, contents, "utf8");
  await fs.rename(tmp, dbFile).catch(async () => {
    // Fallback on rename failure
    await fs.writeFile(dbFile, contents, "utf8");
  });
}

async function read(): Promise<DB> {
  await ensure();
  try {
    const raw = await fs.readFile(dbFile, "utf8");
    if (!raw || !raw.trim()) {
      const empty = emptyDb();
      await writeRaw(JSON.stringify(empty, null, 2));
      return empty;
    }
    const db = JSON.parse(raw) as DB;
    // normalize missing arrays
    (db as any).users ||= [];
    (db as any).lessons ||= [];
    (db as any).entries ||= [];
    (db as any).attempts ||= [];
    (db as any).accounts ||= [];
    (db as any).sessions ||= [];
    (db as any).verificationTokens ||= [];
    (db as any).teacherCodes ||= [];
    (db as any).classes ||= [];
    (db as any).classMemberships ||= [];
    (db as any).chatMessages ||= [];
    (db as any).parties ||= [];
    (db as any).partyPlayers ||= [];
    (db as any).partyAnswers ||= [];
    return db;
  } catch {
    const empty = emptyDb();
    await writeRaw(JSON.stringify(empty, null, 2));
    return empty;
  }
}
async function write(db: DB) { await writeRaw(JSON.stringify(db, null, 2)); }

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
export async function deleteUserById(userId: string) { const db = await read(); db.users = db.users.filter(u=>u.id!==userId); db.classMemberships = (db.classMemberships||[]).filter(m=>m.userId!==userId); db.chatMessages = (db.chatMessages||[]).filter(m=>m.userId!==userId); db.partyPlayers = (db.partyPlayers||[]).filter(p=>p.userId!==userId); db.partyAnswers = (db.partyAnswers||[]).filter(a=>a.userId!==userId); db.accounts = (db.accounts||[]).filter(a=>a.userId!==userId); db.sessions = (db.sessions||[]).filter(s=>s.userId!==userId); await write(db); }

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

// Class helpers
function newClassCode(): string { return Math.random().toString(36).slice(2, 8).toUpperCase(); }

export async function listClasses() { const db = await read(); db.classes ||= []; return db.classes; }
export async function getClassById(classId: string) { const db = await read(); return (db.classes ||= []).find(c=>c.id===classId) || null; }
export async function getClassByCode(code: string) { const db = await read(); return (db.classes ||= []).find(c=>c.code.toUpperCase() === code.toUpperCase()) || null; }
export async function listClassesForUser(userId: string) {
  const db = await read();
  const memberships = (db.classMemberships ||= []).filter(m => m.userId === userId);
  const classes = (db.classes ||= []).filter(c => memberships.some(m => m.classId === c.id));
  return classes;
}

export async function createClass(name: string, teacherId: string, allowMultiple = false) {
  const db = await read();
  const teacher = db.users.find(u => u.id === teacherId);
  if (!teacher) throw new Error('Teacher not found');
  const existing = (db.classes ||= []).filter(c => c.teacherId === teacherId);
  if (teacher.role === 'TEACHER' && !allowMultiple && existing.length > 0) throw new Error('Teacher already has a class');
  const c: ClassRoom = { id: id(), name, code: newClassCode(), teacherId, createdAt: new Date().toISOString(), chatCooldownSec: 0 };
  db.classes.push(c);
  (db.classMemberships ||= []).push({ id: id(), classId: c.id, userId: teacherId, role: 'TEACHER' });
  await write(db);
  return c;
}

export async function regenerateClassCode(classId: string) {
  const db = await read();
  const i = (db.classes ||= []).findIndex(c => c.id === classId);
  if (i === -1) return null;
  db.classes[i].code = newClassCode();
  await write(db);
  return db.classes[i];
}

export async function joinClassByCode(userId: string, code: string) {
  const db = await read();
  const c = (db.classes ||= []).find(x => x.code.toUpperCase() === code.toUpperCase());
  if (!c) return false;
  const exists = (db.classMemberships ||= []).some(m => m.classId === c.id && m.userId === userId);
  if (!exists) db.classMemberships!.push({ id: id(), classId: c.id, userId, role: 'STUDENT' });
  await write(db);
  return true;
}

export async function listClassMembers(classId: string) {
  const db = await read();
  const members = (db.classMemberships ||= []).filter(m => m.classId === classId);
  return members.map(m => ({ ...m, user: db.users.find(u => u.id === m.userId) || null }));
}

export async function postMessage(classId: string, userId: string, content: string) {
  const db = await read();
  const msg: ChatMessage = { id: id(), classId, userId, content: String(content).slice(0, 1000), createdAt: new Date().toISOString() };
  (db.chatMessages ||= []).push(msg);
  await write(db);
  return msg;
}

export async function listMessages(classId: string) {
  const db = await read();
  return (db.chatMessages ||= []).filter(m => m.classId === classId).sort((a,b)=> a.createdAt < b.createdAt ? -1 : 1);
}

export async function updateClass(classId: string, patch: Partial<ClassRoom>) {
  const db = await read();
  const i = (db.classes ||= []).findIndex(c => c.id === classId);
  if (i === -1) return null;
  db.classes![i] = { ...db.classes![i], ...patch };
  await write(db);
  return db.classes![i];
}

export async function removeMember(membershipId: string) {
  const db = await read();
  db.classMemberships = (db.classMemberships||[]).filter(m => m.id !== membershipId);
  await write(db);
}

// Party helpers
function randDir(): 'de2cs'|'cs2de' { return Math.random() < 0.5 ? 'de2cs' : 'cs2de'; }
function shuffle<T>(arr: T[]): T[] { const a = arr.slice(); for (let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }

export async function createParty(data: { classId: string; lessonId: string; mode: 'mc'|'write'; timerSec: number; createdBy: string }) {
  const db = await read();
  const active = (db.parties ||= []).find(p => p.classId === data.classId && p.status !== 'ended');
  if (active) return active;
  const entries = (db.entries || []).filter(e => e.lessonId === data.lessonId);
  const entryIds = shuffle(entries).map(e => e.id);
  const dirs = entryIds.map(() => randDir());
  const p: Party = { id: id(), classId: data.classId, lessonId: data.lessonId, mode: data.mode, timerSec: Math.max(5, Math.min(120, data.timerSec|0)), status: 'lobby', createdBy: data.createdBy, createdAt: new Date().toISOString(), entryIds, dirs, currentIndex: -1 };
  db.parties!.push(p);
  await write(db);
  return p;
}

export async function getActivePartyForClass(classId: string) { const db = await read(); return (db.parties ||= []).find(p => p.classId === classId && p.status !== 'ended') || null; }
export async function listPartiesForClass(classId: string) { const db = await read(); return (db.parties ||= []).filter(p => p.classId === classId).sort((a,b)=> a.createdAt < b.createdAt ? 1 : -1); }
export async function startParty(partyId: string) { const db = await read(); const i = (db.parties ||= []).findIndex(p=>p.id===partyId); if (i===-1) return null; db.parties![i].status = 'running'; db.parties![i].currentIndex = 0; await write(db); return db.parties![i]; }
export async function nextPartyQuestion(partyId: string) { const db = await read(); const i = (db.parties ||= []).findIndex(p=>p.id===partyId); if (i===-1) return null; const p = db.parties![i]; if (p.status !== 'running') return p; if (p.currentIndex < p.entryIds.length - 1) { p.currentIndex++; } else { p.status = 'ended'; } await write(db); return p; }
export async function endParty(partyId: string) { const db = await read(); const i = (db.parties ||= []).findIndex(p=>p.id===partyId); if (i===-1) return null; db.parties![i].status = 'ended'; await write(db); return db.parties![i]; }

export async function joinParty(partyId: string, userId: string, displayName: string) {
  const db = await read();
  const exists = (db.partyPlayers ||= []).find(pl => pl.partyId === partyId && pl.userId === userId);
  if (exists) return exists;
  const pl: PartyPlayer = { id: id(), partyId, userId, displayName, score: 0, joinedAt: new Date().toISOString() };
  db.partyPlayers!.push(pl);
  await write(db);
  return pl;
}
export async function listPartyPlayers(partyId: string) { const db = await read(); return (db.partyPlayers ||= []).filter(pl => pl.partyId === partyId).sort((a,b)=> b.score - a.score); }

export async function submitPartyAnswer(data: { partyId: string; userId: string; entryId: string; dir: 'de2cs'|'cs2de'; answer: string; chosenGender?: 'der'|'die'|'das'|null }) {
  const db = await read();
  const entry = (db.entries||[]).find(e => e.id === data.entryId);
  if (!entry) return { points: 0, correct: false, textCorrect: false, genderCorrect: false };
  const expected = data.dir==='cs2de' ? entry.term : entry.translation;
  const expectedVariants = (data.dir === 'cs2de') ? [expected] : expected.split(/[;,/|]/).map(s=>s.trim()).filter(Boolean);
  const normalize = (s: string) => s.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ƫ/g,'ss').replace(/\s+/g,' ');
  const textCorrect = expectedVariants.map(normalize).some(v => v === normalize(data.answer));
  let genderCorrect = true;
  const eg = entry.genders as ("der"|"die"|"das")[] | undefined;
  if (entry.partOfSpeech === 'noun' && eg && eg.length) {
    genderCorrect = data.chosenGender ? eg.includes(data.chosenGender) : false;
  }
  const correct = textCorrect && genderCorrect;
  const points = correct ? 2 : (textCorrect ? 1 : 0);
  const ans: PartyAnswer = { id: id(), partyId: data.partyId, userId: data.userId, entryId: data.entryId, dir: data.dir, answer: data.answer, points, textCorrect, genderCorrect, createdAt: new Date().toISOString() };
  (db.partyAnswers ||= []).push(ans);
  const player = (db.partyPlayers ||= []).find(p => p.partyId === data.partyId && p.userId === data.userId);
  if (player) player.score += points;
  await write(db);
  return { points, correct, textCorrect, genderCorrect };
}

export async function getPartyState(partyId: string) {
  const db = await read();
  const p = (db.parties ||= []).find(pp=>pp.id===partyId) || null;
  if (!p) return null;
  const playersRaw = (db.partyPlayers ||= []).filter(pl=>pl.partyId===partyId).sort((a,b)=> b.score - a.score);
  const players = playersRaw.map(pl => {
    const u = (db.users||[]).find(x=>x.id===pl.userId);
    return { ...pl, avatarUrl: u?.avatarUrl || null } as any;
  });
  const entryId = p.entryIds[p.currentIndex] || null;
  const dir = p.dirs[p.currentIndex] || 'de2cs';
  return { party: p, players, entryId, dir };
}

