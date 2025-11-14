import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/authOptions";
import { getUserById } from "@/server/store";
import path from "path";
import { promises as fs } from "fs";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions as any);
  const uid = (session as any)?.user?.id as string | undefined;
  if (!uid) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const user = await getUserById(uid);
  if (!user || user.role !== "ADMIN") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const url = new URL(req.url);
  const name = url.searchParams.get("name");
  if (!name) {
    return new NextResponse("Missing name", { status: 400 });
  }

  const safeName = name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const dataDir = process.env.DATA_DIR
    ? path.resolve(process.env.DATA_DIR)
    : path.join(process.cwd(), "data");
  const filesDir = path.join(dataDir, "files");
  const fullPath = path.join(filesDir, safeName);

  try {
    const content = await fs.readFile(fullPath, "utf8");
    return new NextResponse(content, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="${safeName}"`,
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}

