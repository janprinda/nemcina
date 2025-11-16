import { type NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";
import { findUserByEmail } from "@/server/store";
import { JsonAdapter } from "@/server/jsonAdapter";
import bcrypt from "bcryptjs";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const authOptions: NextAuthOptions = {
  adapter: JsonAdapter(),
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 30 },
  providers: [
    Credentials({
      name: "Email a heslo",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Heslo", type: "password" },
      },
      async authorize(credentials) {
        const parse = credentialsSchema.safeParse(credentials);
        if (!parse.success) return null;
        const { email, password } = parse.data;
        const user = await findUserByEmail(email);
        if (!user || !user.passwordHash) return null;
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;
        // Vrátíme user objekt včetně role a dalších polí,
        // aby se vše propsalo do JWT.
        return {
          id: user.id,
          name: user.name ?? null,
          email: user.email ?? undefined,
          role: user.role,
          displayName: user.displayName ?? user.name ?? null,
          avatarUrl: user.avatarUrl ?? null,
          rank: user.rank ?? null,
        } as any;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID || "",
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET || "",
      tenantId: process.env.AZURE_AD_TENANT_ID || "common",
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  pages: { signIn: "/auth" },
  callbacks: {
    async jwt({ token, user }) {
      // Při přihlášení natáhneme data uživatele do tokenu.
      if (user) {
        const u = user as any;
        token.sub = u.id ?? token.sub;
        token.email = u.email ?? token.email;
        token.name = u.name ?? token.name;
        (token as any).role = u.role ?? (token as any).role ?? "USER";
        (token as any).displayName =
          u.displayName ?? u.name ?? (token as any).displayName ?? null;
        (token as any).avatarUrl = u.avatarUrl ?? (token as any).avatarUrl ?? null;
        (token as any).rank = u.rank ?? (token as any).rank ?? null;
      }
      return token as any;
    },
    async session({ session, token }) {
      const id = token.sub as string | undefined;
      if (!id) {
        (session as any).user = undefined;
        return session;
      }

      const role = (token as any).role as "USER" | "TEACHER" | "ADMIN" | undefined;
      const displayName = (token as any).displayName as string | null | undefined;
      const avatarUrl = (token as any).avatarUrl as string | null | undefined;
      const rank = (token as any).rank as string | null | undefined;

      (session as any).user = {
        id,
        email: token.email ?? session.user?.email ?? undefined,
        name: token.name ?? session.user?.name ?? undefined,
        role: role ?? "USER",
        displayName: displayName ?? token.name ?? null,
        avatarUrl: avatarUrl ?? null,
        rank: rank ?? null,
      } as any;

      // Fallback: pokud by role chyběla, ale je to seedovaný admin
      if (
        !(session as any).user.role &&
        ((session as any).user.email === "admin@example.com" ||
          session.user?.email === "admin@example.com")
      ) {
        (session as any).user.role = "ADMIN";
      }

      return session;
    },
  },
};

