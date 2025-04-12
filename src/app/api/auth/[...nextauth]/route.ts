import NextAuth  from "next-auth";
import { authOptions } from "@/lib/authOptions";



declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string | null;
      email?: string | null;
      image?: string | null;
      type: string | null; // Add this line to include the type in the session
    };
  }
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
