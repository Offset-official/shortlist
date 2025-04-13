import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma"

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
        type: { label: "Type", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password || !credentials.type) {
          throw new Error("Please enter your email, password, and user type");
        }

        const userType = credentials.type.toLowerCase();
        
        // Check if the user is a candidate or recruiter
        if (userType === "candidate") {
          // Find candidate by email
          const candidate = await prisma.candidate.findUnique({
            where: { email: credentials.email },
          });

          if (!candidate) {
            throw new Error("No candidate found with this email");
          }

          // Compare passwords
          const isValid = await bcrypt.compare(credentials.password, candidate.password);
          if (!isValid) {
            throw new Error("Invalid password");
          }

          // Return candidate user object
          return {
            id: candidate.id.toString(),
            name: candidate.name,
            email: candidate.email,
            type: "candidate",
          };
        } 
        else if (userType === "recruiter") {
          // Find recruiter by email
          const recruiter = await prisma.recruiter.findUnique({
            where: { email: credentials.email },
          });

          if (!recruiter) {
            throw new Error("No recruiter found with this email");
          }

          // Compare passwords
          const isValid = await bcrypt.compare(credentials.password, recruiter.password);
          if (!isValid) {
            throw new Error("Invalid password");
          }

          // Return recruiter user object
          return {
            id: recruiter.id.toString(),
            name: recruiter.companyName,
            email: recruiter.email,
            type: "recruiter",
          };
        } 
        else {
          throw new Error("Invalid user type");
        }
      },
    }),
  ],
  callbacks: {
    // Attach user info to JWT
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.type = user.type;
        if (user.image) {
          token.picture = user.image;
        }
        console.log("JWT Callback gives USER:", token);
      }
      return token;
    },
    // Make user ID and type available in client session
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        // Add user type to the session
        session.user.type = token.type as string;
      }
      return session;
    },
  },
  // Custom pages
  pages: {
    signIn: "/login",
  },
};