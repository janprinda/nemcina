import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getUserById } from "@/server/store";
import { updateNameAction } from "./actions";
import Link from "next/link";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  const uid = session?.user?.id as string | undefined;
  if (!uid) return <div>Pro přístup se prosím <Link className="underline" href="/auth">přihlas</Link>.</div>;
  const user = await getUserById(uid);

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <h1 className="text-xl font-semibold">Profil</h1>
      <form action={updateNameAction} className="card">
        <div className="card-body space-y-3">
          <div>
            <label className="block text-sm">Zobrazované jméno</label>
            <input name="name" defaultValue={user?.name ?? ''} className="w-full px-3 py-2" placeholder="Tvoje jméno" />
          </div>
          <button className="btn btn-primary" type="submit">Uložit</button>
        </div>
      </form>
      <div className="text-sm muted">Přihlašovací email: {user?.email ?? '—'}</div>
    </div>
  );
}

