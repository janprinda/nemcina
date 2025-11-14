import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/authOptions";
import { getUserById } from "@/server/store";

export default async function AdminIndex() {
  const session = await getServerSession(authOptions);
  let role = "USER";
  const uid = (session as any)?.user?.id as string | undefined;
  if (uid) {
    const user = await getUserById(uid);
    role = user?.role ?? "USER";
  }

  if (!session) {
    return (
      <div>
        Pro přístup se prosím{" "}
        <Link href="/auth" className="underline">
          přihlas
        </Link>
        .
      </div>
    );
  }
  if (role !== "ADMIN") {
    return <div>Potřebuješ roli ADMIN.</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Admin</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/admin/lessons" className="card">
          <div className="card-body">
            <div className="font-medium">Správa lekcí</div>
            <div className="text-sm muted">
              Přidávání a úprava lekcí a slovíček.
            </div>
          </div>
        </Link>
        <Link href="/admin/users" className="card">
          <div className="card-body">
            <div className="font-medium">Uživatelé</div>
            <div className="text-sm muted">
              Role, zobrazované jméno, přezdívka.
            </div>
          </div>
        </Link>
        <Link href="/admin/teacher-codes" className="card">
          <div className="card-body">
            <div className="font-medium">Kódy učitelů</div>
            <div className="text-sm muted">
              Generování kódů, poznámky, export.
            </div>
          </div>
        </Link>
        <Link href="/admin/classes" className="card">
          <div className="card-body">
            <div className="font-medium">Třídy</div>
            <div className="text-sm muted">
              Správa tříd, přiřazování učitelů.
            </div>
          </div>
        </Link>
        <Link href="/admin/data" className="card">
          <div className="card-body">
            <div className="font-medium">Datové soubory</div>
            <div className="text-sm muted">
              Nahrávání a export datových souborů (TXT).
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

