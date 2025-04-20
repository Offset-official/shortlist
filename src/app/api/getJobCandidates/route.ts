import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Assuming you're using Prisma ORM

// Helper function to fetch candidates for a given job ID with pagination
async function getJobCandidates(jobId: string, page: number, limit: number) {
  const candidates = await prisma.candidate.findMany({
    where: {
      appliedJobs: {
        some: {
          id: parseInt(jobId),
        },
      },
    },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: {
      createdAt: 'desc', // Order candidates by application date (most recent first)
    },
    include: {
      appliedJobs: true, // Include job listing details if needed
    },
  });

  return candidates;
}

export async function GET(req: Request) {
  try {
    // Extract query parameters
    const url = new URL(req.url);
    const jobId = url.searchParams.get('jobId');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    // Fetch the candidates
    const candidates = await getJobCandidates(jobId, page, limit);

    // Return the candidates in the response
    return NextResponse.json({ candidates });
  } catch (error) {
    console.error('Error fetching job candidates:', error);
    return NextResponse.json({ error: 'Failed to fetch candidates' }, { status: 500 });
  }
}
