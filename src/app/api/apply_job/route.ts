import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.type !== "candidate") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const candidateId = Number(session.user.id);
    const { jobId } = await req.json();
    if (!jobId) {
      return NextResponse.json({ error: "Missing jobId" }, { status: 400 });
    }
    // Check if already applied
    const alreadyApplied = await prisma.jobListing.findFirst({
      where: {
        id: jobId,
        candidates: { some: { id: candidateId } },
      },
    });
    if (alreadyApplied) {
      return NextResponse.json({ error: "Already applied to this job" }, { status: 400 });
    }
    // Connect candidate to job
    await prisma.jobListing.update({
      where: { id: jobId },
      data: {
        candidates: { connect: { id: candidateId } },
        applicationCount: { increment: 1 },
      },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
