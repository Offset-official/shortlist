import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.type !== 'candidate') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const candidateId = Number(session.user.id);
  const body = await req.json();
  const now = new Date();
  const expiryDateTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now

  // Debug: Log the received payload
  // console.log('Received payload:', body);

  try {
    const interview = await prisma.interview.create({
      data: {
        candidateId,
        jobListingId: 1, // Use a dummy jobListing or create a special one for mocks
        mock: true,
        type: body.type,
        ...(body.dsaId ? { dsaId: Number(body.dsaId) } : {}),
        dsaTopics: Array.isArray(body.dsaTopics)
          ? body.dsaTopics
          : typeof body.dsaTopics === 'string'
          ? body.dsaTopics.split(',').map((t: string) => {
              // Expecting "topic@difficulty" strings when coming as CSV
              const [topic, difficulty] = t.split('@');
              return { topic: topic.trim(), difficulty: difficulty?.trim() || '' };
            })
          : [],
        topics: Array.isArray(body.topics)
          ? body.topics
          : typeof body.topics === 'string'
          ? body.topics.split(',').map((t: string) => t.trim())
          : [],
        programmingLanguage: body.programmingLanguage || null,
        hrTopics: Array.isArray(body.hrTopics)
          ? body.hrTopics
          : typeof body.hrTopics === 'string'
          ? body.hrTopics.split(',').map((t: string) => t.trim())
          : [],
        numQuestions: Number(body.numQuestions) || 3,
        expiryDateTime,
        screenpipeRequired: body.screenpipe ?? false, // Use payload value, default to false
        terminatorRequired: body.terminator ?? false, // Use payload value, default to false
      },
    });

    return NextResponse.json({ id: interview.id });
  } catch (e) {
    console.error('Error creating mock interview:', e);
    return NextResponse.json({ error: 'Could not create mock interview' }, { status: 500 });
  }
}