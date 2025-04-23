// app/api/candidate/interviews/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

/**
 * GET /api/candidate/interviews?page=1&pageSize=8
 * Returns paginated list of interviews for the logged-in candidate.
 */
export async function GET(req: NextRequest) {
  // 1️⃣ Authenticate candidate
  const session = await getServerSession(authOptions);
  if (!session || session.user.type !== 'candidate') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const candidateId = Number(session.user.id);

  // 2️⃣ Parse and validate query params
  const url = new URL(req.url);
  const pageParam = url.searchParams.get('page') ?? '1';
  const sizeParam = url.searchParams.get('pageSize') ?? '8';
  const page = Math.max(1, parseInt(pageParam, 10) || 1);
  const pageSize = Math.max(1, parseInt(sizeParam, 10) || 8);

  try {
    // 3️⃣ Count total
    const totalCount = await prisma.interview.count({
      where: { candidateId },
    });
    const totalPages = Math.ceil(totalCount / pageSize) || 1;

    // 4️⃣ Fetch paginated interviews
    const interviews = await prisma.interview.findMany({
      where: { candidateId },
      orderBy: { expiryDateTime: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        jobListing: { select: { title: true, Recruiter: { select: { companyName: true } } } },
      },
    });

    // 5️⃣ Map to response shape
    const response = {
      interviews: interviews.map(iv => {
        // Expiry logic
        let expired = false;
        if (iv.expiryDateTime) {
          const expiry = new Date(iv.expiryDateTime);
          const now = new Date();
          expired = expiry < now;
        }
        return {
          id: iv.id,
          jobTitle: iv.jobListing.title,
          companyName: iv.jobListing.Recruiter?.companyName ?? '',
          type: iv.type,
          topics: iv.topics,
          expiryDateTime: iv.expiryDateTime.toISOString(),
          expired,
        };
      }),
      page,
      totalPages,
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error('Error fetching candidate interviews:', err);
    return NextResponse.json(
      { error: 'Failed to fetch interviews' },
      { status: 500 }
    );
  }
}
