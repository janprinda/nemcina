import { getUsers, updateUser, deleteUserById } from "@/server/store";
import { revalidatePath } from "next/cache";

async function updateAction(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  if (!id) return;

  const patch: any = {};

  const name = formData.get("name");
  if (name !== null) patch.name = String(name);

  const displayName = formData.get("displayName");
  if (displayName !== null) patch.displayName = String(displayName);

  const nickname = formData.get("nickname");
  if (nickname !== null) patch.nickname = String(nickname);

  const role = formData.get("role");
  if (role !== null) patch.role = String(role) as any;

  const rank = formData.get("rank");
  if (rank !== null) {
    const v = String(rank).trim();
    patch.rank = v || null;
  }

  const scoreBonus = formData.get("scoreBonus");
  if (scoreBonus !== null) {
    const raw = String(scoreBonus).trim();
    if (raw === "") {
      patch.scoreBonus = null;
    } else {
      const num = Number(raw);
      patch.scoreBonus = Number.isFinite(num) ? num : 0;
    }
  }

  if (Object.keys(patch).length === 0) return;

  await updateUser(id, patch);
  revalidatePath("/admin/users");
}

export default async function AdminUsersPage() {
  const users = await getUsers();
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Správa uživatelů</h1>
      <div className="card">
        <div className="card-body overflow-x-auto">
          <table className="w-full min-w-[840px] text-sm align-middle">
            <thead className="muted text-left">
              <tr>
                <th className="py-2 pr-3">Email</th>
                <th className="py-2 pr-3">Jméno</th>
                <th className="py-2 pr-3">Zobrazované</th>
                <th className="py-2 pr-3">Přezdívka</th>
                <th className="py-2 pr-3">Role</th>
                <th className="py-2 pr-3">Titul/Rank</th>
                <th className="py-2 pr-3">Bonus body</th>
                <th className="py-2">Akce</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-[var(--border)]">
                  <td className="py-2 pr-3 max-w-[220px] truncate align-top">
                    {u.email}
                  </td>
                  <td className="py-2 pr-3 align-top">
                    <form action={updateAction} className="min-w-[150px]">
                      <input type="hidden" name="id" value={u.id} />
                      <input
                        name="name"
                        defaultValue={u.name || ""}
                        className="input"
                      />
                    </form>
                  </td>
                  <td className="py-2 pr-3 align-top">
                    <form action={updateAction} className="min-w-[150px]">
                      <input type="hidden" name="id" value={u.id} />
                      <input
                        name="displayName"
                        defaultValue={u.displayName || ""}
                        className="input"
                      />
                    </form>
                  </td>
                  <td className="py-2 pr-3 align-top">
                    <form action={updateAction} className="min-w-[140px]">
                      <input type="hidden" name="id" value={u.id} />
                      <input
                        name="nickname"
                        defaultValue={u.nickname || ""}
                        className="input"
                      />
                    </form>
                  </td>
                  <td className="py-2 pr-3 align-top">
                    <form
                      action={updateAction}
                      className="flex items-center gap-2 min-w-[140px]"
                    >
                      <input type="hidden" name="id" value={u.id} />
                      <select
                        name="role"
                        defaultValue={u.role}
                        className="select w-full"
                      >
                        <option value="USER">USER</option>
                        <option value="TEACHER">TEACHER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </form>
                  </td>
                  <td className="py-2 pr-3 align-top">
                    <form action={updateAction} className="min-w-[160px]">
                      <input type="hidden" name="id" value={u.id} />
                      <input
                        name="rank"
                        defaultValue={u.rank || ""}
                        className="input"
                        placeholder="např. Prefekt"
                      />
                    </form>
                  </td>
                  <td className="py-2 pr-3 align-top">
                    <form action={updateAction} className="min-w-[120px]">
                      <input type="hidden" name="id" value={u.id} />
                      <input
                        name="scoreBonus"
                        type="number"
                        className="input"
                        defaultValue={
                          typeof u.scoreBonus === "number"
                            ? String(u.scoreBonus)
                            : ""
                        }
                        placeholder="+0"
                      />
                    </form>
                  </td>
                  <td className="py-2 pr-3 text-right align-top">
                    <form
                      action={async () => {
                        "use server";
                        await deleteUserById(u.id);
                        revalidatePath("/admin/users");
                      }}
                    >
                      <button
                        className="btn btn-ghost text-red-400 whitespace-nowrap"
                        type="submit"
                      >
                        Smazat
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

