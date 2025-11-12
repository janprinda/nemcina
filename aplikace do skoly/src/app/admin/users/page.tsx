import { getUsers, updateUser } from "@/server/store";
import { revalidatePath } from "next/cache";

async function updateAction(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  const name = String(formData.get("name")||"");
  const displayName = String(formData.get("displayName")||"");
  const nickname = String(formData.get("nickname")||"");
  const role = String(formData.get("role")||"USER");
  await updateUser(id, { name, displayName, nickname, role: role as any });
  revalidatePath("/admin/users");
}

export default async function AdminUsersPage() {
  const users = await getUsers();
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Správa uživatelů</h1>
      <div className="card"><div className="card-body">
        <table className="w-full text-sm align-middle">
          <thead className="muted text-left">
            <tr>
              <th className="py-2 pr-3">Email</th>
              <th className="py-2 pr-3">Jméno</th>
              <th className="py-2 pr-3">Zobrazované</th>
              <th className="py-2 pr-3">Přezdívka</th>
              <th className="py-2 pr-3">Role</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t border-[var(--border)]">
                <td className="py-2 pr-3">{u.email}</td>
                <td className="py-2 pr-3"><form action={updateAction} className="flex items-center gap-2 min-w-40">
                  <input type="hidden" name="id" value={u.id} />
                  <input name="name" defaultValue={u.name||''} className="input" />
                </form></td>
                <td className="py-2 pr-3"><form action={updateAction} className="min-w-40"><input type="hidden" name="id" value={u.id} /><input name="displayName" defaultValue={u.displayName||''} className="input" /></form></td>
                <td className="py-2 pr-3"><form action={updateAction} className="min-w-36"><input type="hidden" name="id" value={u.id} /><input name="nickname" defaultValue={u.nickname||''} className="input" /></form></td>
                <td className="py-2 pr-3"><form action={updateAction} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={u.id} />
                  <select name="role" defaultValue={u.role} className="select">
                    <option value="USER">USER</option>
                    <option value="TEACHER">TEACHER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                  <button className="btn btn-secondary">Uložit</button>
                </form></td>
                <td></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div></div>
    </div>
  );
}
