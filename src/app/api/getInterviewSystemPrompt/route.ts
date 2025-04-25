import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma, { InterviewType } from "@/lib/prisma";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */
interface ExtendedInterview {
  id: number;
  candidateId: number;
  jobListingId: number;
  type: InterviewType;
  systemPrompt: string | null;
  programmingLanguage: string | null;
  dsaTopics: any[] | null;
  topics: string[] | null;
  hrTopics: string[] | null;
  numQuestions: number | null;
  chatHistory: any;
  dsaId?: number | null;
  screenpipeRequired?: boolean | null;
  terminatorRequired?: boolean | null;
  candidate: { name: string };
  jobListing: { title: string };
}

/* -------------------------------------------------------------------------- */
/* GET /api/interview?id=&mock=                                               */
/* -------------------------------------------------------------------------- */
export async function GET(req: NextRequest) {
  /* ---------- Auth check -------------------------------------------------- */
  const session = await getServerSession(authOptions);
  if (!session || session.user.type !== "candidate") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  /* ---------- Parse query ------------------------------------------------- */
  const url = new URL(req.url);
  const id = Number(url.searchParams.get("id"));
  const mock = url.searchParams.get("mock") === "true";
  if (!id) {
    return NextResponse.json({ error: "Missing interview id" }, { status: 400 });
  }

  /* ---------- Fetch interview -------------------------------------------- */
  const interview = await prisma.interview.findUnique({
    where: { id },
    include: {
      jobListing: { select: { title: true } },
      candidate: { select: { name: true } },
    },
  });
  if (!interview || interview.candidateId !== Number(session.user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const iv = interview as unknown as ExtendedInterview;

  /* ------------------------------------------------------------------------ */
  /*  DS A MOCK MODE                                                         */
  /* ------------------------------------------------------------------------ */
  if (mock && iv.dsaId) {
    const dsa = await prisma.codingProblem.findUnique({ where: { id: iv.dsaId } });
    if (!dsa) {
      return NextResponse.json({ error: "DSA question not found" }, { status: 404 });
    }

    const base =
      `[MOCK MODE] You are conducting a mock DSA interview for candidate ${iv.candidate.name}.\n` +
      `Ask the following DSA question in detail guiding the candidate step by step and provide hints if they get stuck.\n` +
      `Title: ${dsa.title}\n` +
      `Difficulty: ${dsa.difficulty}\n` +
      `Description: ${dsa.description}\n` +
      `Do not ask any other questions. After the candidate has attempted the solution and discussed their approach end the interview with <INTERVIEW OVER>.\n` +
      `For parts of your response that should be spoken by an avatar (excluding code blocks technical syntax etc.) wrap those parts in <SPEAKABLE> and </SPEAKABLE> tags.\n` +
      `**Keep every reply short and concise. Use full stops (.) and never use colons (:) or commas (,).**`;

    return NextResponse.json({
      systemPrompt: base,
      screenpipeRequired_: iv.screenpipeRequired ?? true,
      terminatorRequired: iv.terminatorRequired ?? false,
    });
  }

  /* ------------------------------------------------------------------------ */
  /*  REGULAR INTERVIEW                                                      */
  /* ------------------------------------------------------------------------ */
  let base = `You are conducting an interview for the role “${iv.jobListing.title}” with candidate ${iv.candidate.name}. `;

  if (iv.type === InterviewType.TECHNICAL) {
    /* ----- Build topic strings ------------------------------------------- */
    const dsaStr =
      iv.dsaTopics?.length
        ? iv.dsaTopics.map((t: any) => `${t.topic} (${t.difficulty})`).join(" ")
        : "";
    const nonDsaStr = iv.topics?.length ? iv.topics.join(" ") : "";
    const lang = iv.programmingLanguage || "Python";
    const numQuestions = iv.numQuestions || 2;
    const topicStr = [dsaStr, nonDsaStr].filter(Boolean).join(" ");

    base +=
      `Ask exactly ${numQuestions} distinct coding technical questions in ${lang} related to these topics ${topicStr}. ` +
      `At least one question must be DSA. Ask one at a time provide hints when needed then move on. ` +
      `After all questions are done respond with <INTERVIEW OVER>.\n\n` +
      `For parts of your response that should be spoken by an avatar wrap them in <SPEAKABLE> … </SPEAKABLE>.\n` +
      `**Keep every reply short and concise. Use full stops (.) and never use colons (:) or commas (,).**`;
  } else {
    /* ----- HR interview --------------------------------------------------- */
    const hrStr = iv.hrTopics?.length ? iv.hrTopics.join(" ") : "";
    const numQuestions = iv.numQuestions || 2;

    base +=
      `Ask exactly ${numQuestions} HR style behavioral questions about these topics ${hrStr}. ` +
      `Ask one at a time. After all are done respond with <INTERVIEW OVER>.\n\n` +
      `Wrap speakable parts in <SPEAKABLE> </SPEAKABLE>.\n` +
      `**Keep every reply short and concise. Use full stops (.) and never use colons (:) or commas (,).**`;
  }

  if (mock) base = "[MOCK MODE] " + base;

  return NextResponse.json({
    systemPrompt: base,
    screenpipeRequired_: iv.screenpipeRequired ?? true,
    terminatorRequired: iv.terminatorRequired ?? false,
  });
}
