import type { Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/prisma';
import { compare } from 'bcryptjs';

export interface SessionUser {
  id: string;
  name?: string;
  email: string;
  role: string;
}

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user || !user.hashedPassword) return null;
        const isValid = await compare(credentials.password, user.hashedPassword);
        if (!isValid) return null;
        return user;
      },
    }),
  ],
  session: {
    strategy: 'jwt' as const,
  },
  callbacks: {
    async session({ session, token, user: _user }: { session: Session; token: JWT; user?: User }) {
      if (session?.user) {
        const sessionUser = session.user as SessionUser;
        sessionUser.id = token.sub as string;
        // Add role to session.user
        const dbUser = await prisma.user.findUnique({ where: { email: session.user.email as string } });
        sessionUser.role = dbUser?.role || 'USER';
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
}; 