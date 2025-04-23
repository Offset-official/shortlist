import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { interviewId, chatHistory, systemPrompt } = await req.json();
  if (!interviewId || !chatHistory || !systemPrompt) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  try {
    await prisma.interview.update({
      where: { id: interviewId },
      data: {
        chatHistory,
        systemPrompt,
      },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to save chat history' }, { status: 500 });
  }
}
