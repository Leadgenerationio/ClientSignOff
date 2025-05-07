import { PrismaAdapter } from '@auth/prisma-adapter';
import { NextAuthOptions } from 'next-auth';
import { getServerSession } from 'next-auth/next';
import EmailProvider from 'next-auth/providers/email';
import { prisma } from '@/lib/db';
import { Role } from '@prisma/client';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM || 'no-reply@leadgeneration.io',
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Fetch the user to get their role
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true, clientId: true },
        });

        if (dbUser) {
          token.role = dbUser.role;
          token.clientId = dbUser.clientId;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as Role;
        session.user.clientId = token.clientId as string | null;
      }
      return session;
    },
  },
};

export const getServerAuthSession = () => getServerSession(authOptions);

// Role guard helpers
export const isAgencyUser = (session: any) => 
  session?.user?.role === Role.AGENCY;

export const isClientUser = (session: any) => 
  session?.user?.role === Role.CLIENT;

// Type definitions for next-auth
declare module 'next-auth' {
  interface User {
    role: Role;
    clientId?: string | null;
  }
  
  interface Session {
    user: {
      id: string;
      role: Role;
      clientId?: string | null;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: Role;
    clientId?: string | null;
  }
} 