import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getUserById } from "@/server/store";

export default async function AdminIndex() {
  const session = await getServerSession(authOptions);
  let role = "USER";
  if (session?.user?.id) {
    const user = await getUserById(session.user.id as string);
    role = user?.role ?? "USER";
  }

  if (!session) {
    return <div>Pro přístup se prosím <Link href="/auth" className="underline">přihlas</Link>.</div>;
  }
  if (role !== "ADMIN") {
    return <div>Potřebuješ roli ADMIN.</div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Admin</h1>
      <ul className="list-disc pl-5 text-sm">
        <li><Link href="/admin/lessons">Správa lekcí</Link></li>
      </ul>
    </div>
  );
}
