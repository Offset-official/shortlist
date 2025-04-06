// File: app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export const authOptions: AuthOptions = {
  // Use JWT tokens since we don't have a DB session table
  session: {
    strategy: "jwt",
  },
  // Configure one or more authentication providers
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

        // 1) Find the user by email
        const candidate = await prisma.candidate.findUnique({
          where: { email: credentials.email },
        });

        if (!candidate) {
          throw new Error("No user found");
        }

        // 2) Compare the provided password with the stored (hashed) password
        const isValid = await bcrypt.compare(credentials.password, candidate.password);
        if (!isValid) {
          throw new Error("Invalid password");
        }

        // 3) Return the user object. NextAuth will store in JWT.
        return {
          id: candidate.id,
          name: candidate.name,
          email: candidate.email,
        };
      },
    }),
  ],
  // You can add callbacks here if needed
  callbacks: {
    // Attach user info to JWT
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    // Make the user ID available in client session
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id;
      }
      return session;
    },
  },
  // You can customize pages (error, signIn, etc.) if you wish:
  pages: {
    signIn: "/login", // we will create this page
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
