import { NextResponse } from "next/server";
import { listClasses, getUsers } from "@/server/store";

export async function GET() {
  const [classes, users] = await Promise.all([listClasses(), getUsers()]);
  return NextResponse.json({ classes, users });
}

