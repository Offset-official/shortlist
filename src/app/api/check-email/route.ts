import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  // Extract the 'email' query param
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ exists: false }); 
  }

  // Check if a Candidate with this email exists
  const candidate = await prisma.candidate.findUnique({
    where: { email },
  });

  return NextResponse.json({ exists: !!candidate });
}
