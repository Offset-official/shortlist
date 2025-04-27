import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const interviewId = url.searchParams.get('interviewId');
  if (!interviewId) {
    return NextResponse.json({ error: 'Missing interviewId' }, { status: 400 });
  }
  const interview = await prisma.interview.findUnique({
    where: { id: Number(interviewId) },
    include: {
      jobListing: { select: { title: true } },
      candidate: { select: { name: true } },
    },
  });
  if (!interview || !interview.interviewAnalysis) {
    return NextResponse.json({ error: 'No analysis found' }, { status: 404 });
  }
  return NextResponse.json({
    ...interview,
    interviewAnalysis: interview.interviewAnalysis,
  });
}
