import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { UserSession } from "@/interfaces/misc_interfaces";

// Extend the NextAuth session type
declare module "next-auth" {
  interface Session extends UserSession {}
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };