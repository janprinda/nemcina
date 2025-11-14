import { getServerSession } from "next-auth";
import { authOptions } from "@/server/authOptions";
import { getUserById } from "@/server/store";
import { updateProfileAction } from "./actions";
import Link from "next/link";
import AvatarUpload from "@/components/AvatarUpload";
import SignOutButton from "@/components/SignOutButton";
import ProfileInterests from "@/components/ProfileInterests";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions as any);
  const uid = (session as any)?.user?.id as string | undefined;
  if (!uid) {
    return (
      <div>
        Pro přístup se prosím{" "}
        <Link className="underline" href="/auth">
          přihlas
        </Link>
        .
      </div>
    );
  }

  const user = await getUserById(uid);
  const display = user?.displayName || user?.name || user?.email || "Bez jména";
  const phoneCode = (user?.phone || "").split(" ")[0] || "+420";
  const phoneNumber = (user?.phone || "").split(" ").slice(1).join(" ");

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold">Profil</h1>

      <div className="card">
        <div className="card-body flex items-center justify-between gap-4 text-sm">
          <div>
            <div className="muted text-xs">Přihlášen jako</div>
            <div className="text-lg font-semibold">Vítej, {display}!</div>
            <div className="text-xs muted">
              Tady si můžeš upravit svůj profil, kontaktní údaje a heslo.
            </div>
          </div>
          <SignOutButton />
        </div>
      </div>

      <form
        action={updateProfileAction}
        className="card"
        encType="multipart/form-data"
      >
        <div className="card-body space-y-6">
          <div className="grid md:grid-cols-3 gap-6 items-start">
            <div className="md:col-span-2 grid gap-3 md:grid-cols-2">
              <div>
                <label className="block text-sm">Jméno</label>
                <input
                  name="name"
                  defaultValue={user?.name ?? ""}
                  className="input"
                  placeholder="Jméno"
                />
              </div>
              <div>
                <label className="block text-sm">Zobrazované jméno</label>
                <input
                  name="displayName"
                  defaultValue={user?.displayName ?? ""}
                  className="input"
                  placeholder="Zobrazované jméno"
                />
              </div>
              <div>
                <label className="block text-sm">Přezdívka</label>
                <input
                  name="nickname"
                  defaultValue={user?.nickname ?? ""}
                  className="input"
                  placeholder="Přezdívka"
                />
              </div>
              <div>
                <label className="block text-sm">Datum narození</label>
                <input
                  name="birthDate"
                  type="date"
                  defaultValue={user?.birthDate ?? ""}
                  className="input"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm">Telefon</label>
                <div className="flex gap-2">
                  <select
                    name="phoneCode"
                    defaultValue={phoneCode}
                    className="select"
                  >
                    <option value="+420">+420 (CZ)</option>
                    <option value="+421">+421 (SK)</option>
                    <option value="+49">+49 (DE)</option>
                    <option value="+43">+43 (AT)</option>
                    <option value="+44">+44 (UK)</option>
                    <option value="+48">+48 (PL)</option>
                  </select>
                  <input
                    name="phoneNumber"
                    defaultValue={phoneNumber}
                    className="input flex-1"
                    placeholder="Telefonní číslo"
                  />
                </div>
              </div>

              <ProfileInterests initial={user?.interests || []} />
            </div>

            <div className="space-y-3">
              <div className="text-sm muted">Profilová fotka</div>
              <AvatarUpload
                name="avatar"
                initialSrc={user?.avatarUrl || "/avatar-placeholder.svg"}
              />
              <div className="text-xs muted">
                Podporované formáty: JPG, PNG, GIF.
              </div>
              <div className="text-sm muted">
                Přihlašovací email: {user?.email ?? "—"}
              </div>
            </div>
          </div>

          <div className="border-t border-[var(--border)] pt-4 mt-2 space-y-3">
            <h2 className="text-sm font-semibold">Změna hesla</h2>
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <label className="block text-sm">Současné heslo</label>
                <input
                  name="currentPassword"
                  type="password"
                  className="input"
                  autoComplete="current-password"
                />
              </div>
              <div>
                <label className="block text-sm">Nové heslo</label>
                <input
                  name="newPassword"
                  type="password"
                  className="input"
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className="block text-sm">Potvrzení nového hesla</label>
                <input
                  name="newPasswordConfirm"
                  type="password"
                  className="input"
                  autoComplete="new-password"
                />
              </div>
            </div>
            <p className="text-xs muted">
              Nové heslo musí mít alespoň 8 znaků, jedno velké písmeno a číslo.
            </p>
          </div>

          <div className="mt-2">
            <button className="btn btn-primary" type="submit">
              Uložit změny
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

