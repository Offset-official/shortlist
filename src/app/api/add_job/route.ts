import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.type !== "recruiter") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const recruiterId = session.user.id;
    const body = await req.json();
    const {
      title,
      location,
      remote = false,
      salary,
      description,
      employmentType,
      experienceLevel,
      jobRole,
      skills = [],
      education,
      expiryDate,
    } = body;

    if (!title || !description || !employmentType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const job = await prisma.jobListing.create({
      data: {
        title,
        companyId: parseInt(recruiterId),
        location,
        remote,
        salary,
        description,
        employmentType,
        experienceLevel,
        jobRole,
        skills,
        education,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      },
    });
    return NextResponse.json({ success: true, job });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
