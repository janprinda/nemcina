import type { Adapter, AdapterAccount } from "next-auth/adapters";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

type DB = {
  users: any[];
  accounts?: any[];
  sessions?: any[];
  verificationTokens?: any[];
};

const dbPath = path.join(process.cwd(), "data", "db.json");

async function readDB(): Promise<DB> {
  await fs.mkdir(path.dirname(dbPath), { recursive: true });
  try {
    const raw = await fs.readFile(dbPath, "utf8");
    const db = JSON.parse(raw);
    db.accounts ||= [];
    db.sessions ||= [];
    db.verificationTokens ||= [];
    db.users ||= [];
    return db;
  } catch {
    const empty: DB = { users: [], accounts: [], sessions: [], verificationTokens: [] };
    await fs.writeFile(dbPath, JSON.stringify(empty, null, 2), "utf8");
    return empty;
  }
}

async function writeDB(db: DB) {
  await fs.writeFile(dbPath, JSON.stringify(db, null, 2), "utf8");
}

export function JsonAdapter(): Adapter {
  return {
    async createUser(user: any) {
      const db = await readDB();
      const u = { id: randomUUID(), role: "USER", ...user } as any;
      db.users.push(u);
      await writeDB(db);
      return { id: u.id, name: u.name ?? null, email: u.email ?? null, emailVerified: u.emailVerified ?? null, image: u.image ?? null } as any;
    },
    async getUser(id) {
      const db = await readDB();
      return db.users.find((u) => u.id === id) ?? null;
    },
    async getUserByEmail(email) {
      const db = await readDB();
      return db.users.find((u) => (u.email || "").toLowerCase() === String(email || "").toLowerCase()) ?? null;
    },
    async getUserByAccount({ provider, providerAccountId }) {
      const db = await readDB();
      const acc = db.accounts!.find((a) => a.provider === provider && a.providerAccountId === providerAccountId);
      if (!acc) return null;
      return db.users.find((u) => u.id === acc.userId) ?? null;
    },
    async updateUser(user: any) {
      const db = await readDB();
      const i = db.users.findIndex((u) => u.id === user.id);
      if (i === -1) return null;
      db.users[i] = { ...db.users[i], ...user };
      await writeDB(db);
      return db.users[i];
    },
    async deleteUser(userId) {
      const db = await readDB();
      db.users = db.users.filter((u) => u.id !== userId);
      db.accounts = db.accounts!.filter((a) => a.userId !== userId);
      db.sessions = db.sessions!.filter((s) => s.userId !== userId);
      await writeDB(db);
      return null;
    },
    async linkAccount(account: any) {
      const db = await readDB();
      const a = { id: randomUUID(), ...account } as AdapterAccount;
      db.accounts!.push(a);
      await writeDB(db);
      return a;
    },
    async unlinkAccount({ provider, providerAccountId }: any) {
      const db = await readDB();
      db.accounts = db.accounts!.filter((a) => !(a.provider === provider && a.providerAccountId === providerAccountId));
      await writeDB(db);
      return undefined as any;
    },
    async createSession(session: any) {
      const db = await readDB();
      const s = { id: randomUUID(), ...session } as any;
      db.sessions!.push(s);
      await writeDB(db);
      return s;
    },
    async getSessionAndUser(sessionToken) {
      const db = await readDB();
      const s = db.sessions!.find((x) => x.sessionToken === sessionToken);
      if (!s) return null;
      const user = db.users.find((u) => u.id === s.userId);
      if (!user) return null;
      return { session: s, user } as any;
    },
    async updateSession(session: any) {
      const db = await readDB();
      const i = db.sessions!.findIndex((s) => s.sessionToken === session.sessionToken);
      if (i === -1) return null as any;
      db.sessions![i] = { ...db.sessions![i], ...session };
      await writeDB(db);
      return db.sessions![i] as any;
    },
    async deleteSession(sessionToken: string) {
      const db = await readDB();
      db.sessions = db.sessions!.filter((s) => s.sessionToken !== sessionToken);
      await writeDB(db);
      return null as any;
    },
    async createVerificationToken(token: any) {
      const db = await readDB();
      db.verificationTokens!.push(token);
      await writeDB(db);
      return token;
    },
    async useVerificationToken(params: any) {
      const db = await readDB();
      const i = db.verificationTokens!.findIndex((t) => t.identifier === params.identifier && t.token === params.token);
      if (i === -1) return null;
      const [t] = db.verificationTokens!.splice(i, 1);
      await writeDB(db);
      return t;
    },
  };
}
