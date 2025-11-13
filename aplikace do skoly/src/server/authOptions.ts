import { type NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";
import { findUserByEmail, getUserById } from "@/server/store";
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
        return { id: user.id, name: user.name ?? null, email: user.email ?? undefined } as any;
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
      try {
        const id = (user as any)?.id || token.sub;
        if (id) {
          const u = await getUserById(id as string);
          if (u) (token as any).role = u.role;
        }
      } catch {}
      return token as any;
    },
    async session({ session, token }) {
      (session as any).user = { ...session.user, id: token.sub, role: (token as any).role } as any;
      // Fallback: if role missing, try infer admin by email (seeded admin)
      if (!(session as any).user.role && session.user?.email === 'admin@example.com') {
        (session as any).user.role = 'ADMIN';
      }
      return session;
    },
  },
};
