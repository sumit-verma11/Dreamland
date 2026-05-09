import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import type { Adapter, AdapterUser } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import { verifyOtpCookie } from "@/lib/otp";
import { prisma } from "@/lib/prisma";
import { loginSchema, verifyOtpSchema } from "@/lib/validation";

// User.image is renamed to User.avatar in our schema. NextAuth's PrismaAdapter
// reads/writes `image`, so we wrap the user-facing methods to translate.
function nestiqAdapter(): Adapter {
  const base = PrismaAdapter(prisma);

  const toAdapter = (u: {
    id: string;
    name: string | null;
    email: string;
    emailVerified: Date | null;
    avatar: string | null;
  }): AdapterUser => ({
    id: u.id,
    name: u.name,
    email: u.email,
    emailVerified: u.emailVerified,
    image: u.avatar,
  });

  return {
    ...base,
    async createUser(data: AdapterUser) {
      const { id: _id, image, ...rest } = data;
      void _id;
      const user = await prisma.user.create({
        data: { ...rest, avatar: image ?? null },
      });
      return toAdapter(user);
    },
    async getUser(id: string) {
      const user = await prisma.user.findUnique({ where: { id } });
      return user ? toAdapter(user) : null;
    },
    async getUserByEmail(email: string) {
      const user = await prisma.user.findUnique({ where: { email } });
      return user ? toAdapter(user) : null;
    },
    async getUserByAccount({
      provider,
      providerAccountId,
    }: {
      provider: string;
      providerAccountId: string;
    }) {
      const account = await prisma.account.findUnique({
        where: { provider_providerAccountId: { provider, providerAccountId } },
        include: { user: true },
      });
      return account ? toAdapter(account.user) : null;
    },
    async updateUser(data: Partial<AdapterUser> & Pick<AdapterUser, "id">) {
      const { id, image, ...rest } = data;
      const user = await prisma.user.update({
        where: { id },
        data: { ...rest, ...(image !== undefined && { avatar: image }) },
      });
      return toAdapter(user);
    },
  };
}

export const authOptions: NextAuthOptions = {
  adapter: nestiqAdapter(),
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      id: "credentials",
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });
        if (!user?.hashedPassword) return null;

        const valid = await compare(parsed.data.password, user.hashedPassword);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar,
        };
      },
    }),
    CredentialsProvider({
      id: "phone-otp",
      name: "Phone",
      credentials: {
        phone: { label: "Phone", type: "tel" },
        code: { label: "Code", type: "text" },
      },
      async authorize(credentials) {
        const parsed = verifyOtpSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const result = await verifyOtpCookie(parsed.data.phone, parsed.data.code);
        if (!result.ok) return null;

        const phone = parsed.data.phone;
        const existing = await prisma.user.findFirst({ where: { phone } });
        const user = existing
          ? existing.verified
            ? existing
            : await prisma.user.update({ where: { id: existing.id }, data: { verified: true } })
          : await prisma.user.create({
              data: {
                phone,
                verified: true,
                email: `${phone.replace(/[^0-9]/g, "")}@phone.nestiq.local`,
              },
            });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) token.id = user.id;
      const id = token.id as string | undefined;
      if (id && (trigger === "update" || token.role === undefined)) {
        const dbUser = await prisma.user.findUnique({
          where: { id },
          select: { role: true, phone: true, verified: true, avatar: true, name: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.phone = dbUser.phone;
          token.verified = dbUser.verified;
          token.picture = dbUser.avatar;
          token.name = dbUser.name;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.role = (token.role as typeof session.user.role) ?? "BUYER";
        session.user.phone = (token.phone as string | null | undefined) ?? null;
        session.user.verified = Boolean(token.verified);
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
