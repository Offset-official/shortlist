// lib/auth.ts
import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma"
import bcrypt from "bcrypt";


export const authOptions: AuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Please enter your email and password");
        }
        const candidate = await prisma.candidate.findUnique({
          where: { email: credentials.email },
        });
        if (!candidate) {
          throw new Error("No user found");
        }
        const isValid = await bcrypt.compare(credentials.password, candidate.password);
        if (!isValid) {
          throw new Error("Invalid password");
        }
        return {
          id: candidate.id.toString(),
          name: candidate.name,
          email: candidate.email,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id && session.user) {
        (session.user as { id: string }).id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
