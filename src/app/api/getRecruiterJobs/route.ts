import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.type !== "recruiter") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const recruiterId = session.user.id;
    // Get all jobs for this recruiter, including applicants
    const jobs = await prisma.jobListing.findMany({
      where: { companyId: parseInt(recruiterId, 10) },
      include: {
        candidates: {
          select: {
            id: true,
            name: true,
            email: true,
            resume: true,
            // Add more fields as needed
          },
        },
      },
      orderBy: { postedDate: "desc" },
    });
    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("Failed to fetch recruiter jobs:", error);
    return NextResponse.json({ error: "Failed to load recruiter jobs" }, { status: 500 });
  }
}
