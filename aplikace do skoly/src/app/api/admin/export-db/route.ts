import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/authOptions";
import { getUserById } from "@/server/store";
import path from "path";
import { promises as fs } from "fs";

export async function GET() {
  const session = await getServerSession(authOptions as any);
  const uid = (session as any)?.user?.id as string | undefined;
  if (!uid) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const user = await getUserById(uid);
  if (!user || user.role !== "ADMIN") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const dataDir = process.env.DATA_DIR
    ? path.resolve(process.env.DATA_DIR)
    : path.join(process.cwd(), "data");
  const dbPath = path.join(dataDir, "db.json");

  const content = await fs
    .readFile(dbPath, "utf8")
    .catch(() => JSON.stringify({ error: "db.json not found" }, null, 2));

  return new NextResponse(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": 'attachment; filename="db.txt"',
    },
  });
}

