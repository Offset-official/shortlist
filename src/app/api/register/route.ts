// File: app/api/register/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { name, email, password, location, collegeName, dreamCompanies, skills } =
      await request.json();

    // Check if user exists
    const existingUser = await prisma.candidate.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with that email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new candidate
    const candidate = await prisma.candidate.create({
      data: {
        name,
        email,
        password: hashedPassword,
        location,
        collegeName,
        dreamCompanies,
        skills,
      },
    });

    return NextResponse.json({ success: true, candidateId: candidate.id });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
