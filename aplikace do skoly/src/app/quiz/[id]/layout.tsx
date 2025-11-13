import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/authOptions";
import { redirect } from "next/navigation";

export default async function QuizSectionLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions as any);
  if (!session) redirect("/auth");
  return <>{children}</>;
}

