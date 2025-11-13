import { getServerSession } from "next-auth";
import { authOptions } from "@/server/authOptions";
import { getUserById } from "@/server/store";
import { updateProfileAction } from "./actions";
import Link from "next/link";
import AvatarUpload from "@/components/AvatarUpload";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions as any);
  const uid = (session as any)?.user?.id as string | undefined;
  if (!uid) return <div>Pro přístup se prosím <Link className="underline" href="/auth">přihlas</Link>.</div>;
  const user = await getUserById(uid);
  const display = user?.displayName || user?.name || user?.email || "—";

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold">Profil</h1>
      <div className="card"><div className="card-body text-sm">Přihlášen jako: <b>{display}</b></div></div>
      <form action={updateProfileAction} className="card" encType="multipart/form-data">
        <div className="card-body">
          <div className="grid md:grid-cols-3 gap-6 items-start">
            <div className="md:col-span-2 grid gap-3 md:grid-cols-2">
              <div>
                <label className="block text-sm">Jméno</label>
                <input name="name" defaultValue={user?.name ?? ''} className="input" placeholder="Jméno" />
              </div>
              <div>
                <label className="block text-sm">Zobrazované jméno</label>
                <input name="displayName" defaultValue={user?.displayName ?? ''} className="input" placeholder="Zobrazované jméno" />
              </div>
              <div>
                <label className="block text-sm">Přezdívka</label>
                <input name="nickname" defaultValue={user?.nickname ?? ''} className="input" placeholder="Přezdívka" />
              </div>
              <div>
                <label className="block text-sm">Datum narození</label>
                <input name="birthDate" type="date" defaultValue={user?.birthDate ?? ''} className="input" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm">Telefon</label>
                <div className="flex gap-2">
                  <select name="phoneCode" defaultValue={(user?.phone||'').split(' ')[0] || '+420'} className="select">
                    <option value="+420">+420 (CZ)</option>
                    <option value="+421">+421 (SK)</option>
                    <option value="+49">+49 (DE)</option>
                    <option value="+43">+43 (AT)</option>
                    <option value="+44">+44 (UK)</option>
                    <option value="+48">+48 (PL)</option>
                  </select>
                  <input name="phoneNumber" defaultValue={(user?.phone||'').split(' ').slice(1).join(' ')} className="input flex-1" placeholder="Telefonní číslo" />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm">Zájmy (oddělené čárkou)</label>
                <input name="interests" defaultValue={(user?.interests||[]).join(', ')} className="input" placeholder="např. fotbal, hudba, cestování" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="text-sm muted">Profilová fotka</div>
              <AvatarUpload name="avatar" initialSrc={user?.avatarUrl || '/avatar-placeholder.png'} />
              <div className="text-sm muted">Přihlašovací email: {user?.email ?? '—'}</div>
            </div>
          </div>
          <div className="mt-4">
            <button className="btn btn-primary" type="submit">Uložit změny</button>
          </div>
        </div>
      </form>
    </div>
  );
}

