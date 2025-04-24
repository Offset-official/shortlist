import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.type !== "candidate") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { interviewId, chatHistory } = await req.json();
  if (!interviewId) {
    return NextResponse.json({ error: "Missing interview id" }, { status: 400 });
  }
  await prisma.interview.update({
    where: { id: Number(interviewId) },
    data: { chatHistory },
  });
  return NextResponse.json({ success: true });
}
