import { getServerSession } from "next-auth";
import { authOptions } from "@/server/authOptions";
import { getUserById } from "@/server/store";
import { promises as fs } from "fs";
import path from "path";

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

function getDataDirs() {
  const dataDir = process.env.DATA_DIR
    ? path.resolve(process.env.DATA_DIR)
    : path.join(process.cwd(), "data");
  const filesDir = path.join(dataDir, "files");
  const dbPath = path.join(dataDir, "db.json");
  return { dataDir, filesDir, dbPath };
}

async function uploadFileAction(formData: FormData) {
  "use server";
  const session = await getServerSession(authOptions as any);
  const uid = (session as any)?.user?.id as string | undefined;
  if (!uid) return;
  const user = uid ? await getUserById(uid) : null;
  if (!user || user.role !== "ADMIN") return;

  const file = formData.get("file") as unknown as File | null;
  if (!file || !(file as any).arrayBuffer) return;

  const { dataDir, filesDir, dbPath } = getDataDirs();
  await ensureDir(filesDir);
  await ensureDir(dataDir);

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const original = file.name || "db.txt";
  const safeName = original.replace(/[^a-zA-Z0-9._-]/g, "_");

  // archiv nahraného souboru
  const archivedName = `${Date.now()}-${safeName}`;
  const fullPath = path.join(filesDir, archivedName);
  await fs.writeFile(fullPath, buffer);

  const text = buffer.toString("utf8");

  // validace a normalizace JSONu – aby se databáze nerozbila a byla kompatibilní
  let parsed: any;
  try {
    parsed = JSON.parse(text);
  } catch {
    return;
  }

  parsed.users ||= [];
  parsed.lessons ||= [];
  parsed.entries ||= [];
  parsed.attempts ||= [];
  parsed.accounts ||= [];
  parsed.sessions ||= [];
  parsed.verificationTokens ||= [];
  parsed.teacherCodes ||= [];
  parsed.classes ||= [];
  parsed.classMemberships ||= [];
  parsed.chatMessages ||= [];
  parsed.assignments ||= [];
  parsed.parties ||= [];
  parsed.partyPlayers ||= [];
  parsed.partyAnswers ||= [];
  parsed.subjects ||= [];

  // pokud chybí předměty, doplníme výchozí Němčinu
  if (Array.isArray(parsed.subjects) && parsed.subjects.length === 0) {
    parsed.subjects.push({
      id: "nemcina-subject-1",
      slug: "nemcina",
      title: "Němčina",
      description: "Slovíčka, kvízy, třídy a živé aktivity.",
      active: true,
      createdAt: new Date().toISOString(),
    });
  }

  const finalText = JSON.stringify(parsed, null, 2);

  // záloha původního db.json
  try {
    await fs.access(dbPath);
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = path.join(dataDir, `db-backup-${stamp}.json`);
    await fs.copyFile(dbPath, backupPath);
  } catch {
    // pokud db.json neexistuje, není co zálohovat
  }

  // přepsat db.json novým (normalizovaným) obsahem
  await fs.writeFile(dbPath, finalText, "utf8");
}

export default async function AdminDataPage() {
  const session = await getServerSession(authOptions as any);
  const uid = (session as any)?.user?.id as string | undefined;
  if (!uid) return <div>Prosím přihlas se.</div>;
  const user = await getUserById(uid);
  if (!user || user.role !== "ADMIN") return <div>Potřebuješ roli ADMIN.</div>;

  const { filesDir } = getDataDirs();
  await ensureDir(filesDir);
  const entries = await fs.readdir(filesDir).catch(() => [] as string[]);
  const files = entries.filter((e) => !e.startsWith("."));

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold">Datové soubory</h1>

      <div className="card">
        <div className="card-body space-y-3">
          <div className="font-medium">Nahrát datový soubor (db.txt)</div>
          <form
            action={uploadFileAction}
            encType="multipart/form-data"
            className="space-y-2"
          >
            <input
              type="file"
              name="file"
              accept=".txt,text/plain,application/json"
              className="block text-sm"
            />
            <button type="submit" className="btn btn-primary">
              Nahrát a použít jako databázi
            </button>
          </form>
          <p className="text-xs muted">
            Soubor musí obsahovat platný JSON export databáze. Původní db.json
            se před přepsáním automaticky zazálohuje.
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-body space-y-2">
          <div className="font-medium">Export databáze</div>
          <p className="text-sm muted">
            Stáhne aktuální obsah databáze jako textový soubor.
          </p>
          <a href="/api/admin/export-db" className="btn btn-secondary">
            Exportovat databázi do TXT
          </a>
        </div>
      </div>

      <div className="card">
        <div className="card-body space-y-2">
          <div className="font-medium">Archiv nahraných souborů</div>
          {files.length === 0 && (
            <div className="text-sm muted">Zatím žádné soubory.</div>
          )}
          <ul className="text-sm space-y-1">
            {files.map((name) => (
              <li key={name} className="flex items-center justify-between gap-2">
                <span className="truncate">{name}</span>
                <a
                  href={`/api/admin/data/file?name=${encodeURIComponent(name)}`}
                  className="btn btn-ghost text-xs"
                >
                  Stáhnout TXT
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

