import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma, { InterviewType } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.type !== "candidate") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const id = Number(url.searchParams.get("id"));
  const mock = url.searchParams.get("mock") === "true";

  if (!id) {
    return NextResponse.json({ error: "Missing interview id" }, { status: 400 });
  }

  // Fetch the interview
  const iv = await prisma.interview.findUnique({
    where: { id },
    include: {
      jobListing: { select: { title: true } },
      candidate: { select: { name: true } },
    },
  });

  if (!iv || iv.candidateId !== Number(session.user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Build a prompt that quizzes on 2 questions based on type/topics
  let base = `You are conducting an interview for the role “${iv.jobListing.title}” with candidate ${iv.candidate.name}. `;
  if (iv.type === InterviewType.TECHNICAL) {
    base += `Ask exactly 2 distinct coding/DSA questions in Python related to these topics: ${iv.topics.join(
      ", "
    )}. After each hint-based interaction, move to the next question. When both are complete, respond with <INTERVIEW OVER>. `;
  } else {
    base += `Ask exactly 2 HR-style behavioral questions about past experiences relevant to this role. After both are done, respond with <INTERVIEW OVER>. `;
  }

  if (mock) {
    base = "[MOCK MODE] " + base;
  }

  return NextResponse.json({ systemPrompt: base });
}
