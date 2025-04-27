import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.type !== "candidate") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { interviewId } = await req.json();
  if (!interviewId) {
    return NextResponse.json({ error: "Missing interview id" }, { status: 400 });
  }
  const interview = await prisma.interview.findUnique({ where: { id: Number(interviewId) } });
  if (!interview) {
    return NextResponse.json({ error: "Interview not found" }, { status: 404 });
  }
  if (interview.interviewStarted) {
    return NextResponse.json({ error: "Interview already taken." }, { status: 409 });
  }
  await prisma.interview.update({
    where: { id: Number(interviewId) },
    data: { interviewStarted: true, interviewStartedAt: new Date() },
  });
  return NextResponse.json({ success: true });
}
