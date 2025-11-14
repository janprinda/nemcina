"use client";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();

  const handleClick = async () => {
    // Odhlásit uživatele a ručně přesměrovat na přihlášení
    await signOut({ redirect: false });
    router.push("/auth");
  };

  return (
    <button className="btn btn-secondary" onClick={handleClick}>
      Odhlásit
    </button>
  );
}

