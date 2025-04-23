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

  let base = `You are conducting an interview for the role “${iv.jobListing.title}” with candidate ${iv.candidate.name}. `;

  if (iv.type === InterviewType.TECHNICAL) {
    // DSA topics with difficulty
    let dsaStr = '';
    if (iv.dsaTopics && Array.isArray(iv.dsaTopics) && iv.dsaTopics.length > 0) {
      dsaStr = iv.dsaTopics.map((t: any) => `${t.topic} (${t.difficulty})`).join(", ");
    }
    // Non-DSA topics
    let nonDsaStr = iv.topics && iv.topics.length > 0 ? iv.topics.join(", ") : '';
    // Programming language
    let lang = iv.programmingLanguage || 'Python';
    // Number of questions
    let numQuestions = iv.numQuestions || 2;
    let topicStr = [dsaStr, nonDsaStr].filter(Boolean).join(", ");
    base += `Ask exactly ${numQuestions} distinct coding/technical questions in ${lang} related to these topics: ${topicStr}. At least one question must be DSA. For each question, ask one at a time, and after each hint-based interaction, move to the next question. When all are complete, respond with <INTERVIEW OVER>.

For parts of your response that should be spoken by an avatar (excluding code blocks, technical syntax, etc.), wrap those parts in <SPEAKABLE> and </SPEAKABLE> tags. For example: 
<SPEAKABLE>Here's your next question about arrays:</SPEAKABLE>
\`\`\`python
def example_code():
    pass
\`\`\`
<SPEAKABLE>Can you explain your approach?</SPEAKABLE>`;
  } else {
    // HR interview
    let hrStr = iv.hrTopics && iv.hrTopics.length > 0 ? iv.hrTopics.join(", ") : '';
    let numQuestions = iv.numQuestions || 2;
    base += `Ask exactly ${numQuestions} HR-style behavioral questions about these topics: ${hrStr}. Ask one at a time. After all are done, respond with <INTERVIEW OVER>.
    
For parts of your response that should be spoken by an avatar, wrap those parts in <SPEAKABLE> and </SPEAKABLE> tags. For example: <SPEAKABLE>Tell me about a time when you faced a challenge in a team setting?</SPEAKABLE>`;
  }

  if (mock) {
    base = "[MOCK MODE] " + base;
  }

  return NextResponse.json({ systemPrompt: base });
}
