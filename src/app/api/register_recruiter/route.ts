// File: app/api/register/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
  try {
    // Get all recruiter fields from request body
    const {
      companyName,
      email,
      password,
      website,
      location,
      industry,
      values,
      description,
      companySize,
      linkedInUrl
    } = await request.json();

    // Check if recruiter exists
    const existingRecruiter = await prisma.recruiter.findUnique({ where: { email } });
    if (existingRecruiter) {
      return NextResponse.json(
        { error: "Recruiter with that email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new recruiter
    const recruiter = await prisma.recruiter.create({
      data: {
        companyName,
        email,
        password: hashedPassword,
        website,
        location,
        industry,
        values,
        description,
        companySize,
        linkedInUrl,
      },
    });

    return NextResponse.json({ success: true, recruiterId: recruiter.id });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
