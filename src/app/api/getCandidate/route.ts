// app/api/getCandidate/route.ts
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Extract userId and include from query parameters
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');
    const includeParam = searchParams.get('include'); // e.g. "appliedJobs,interviews"

    console.log('Fetching candidate with user_id:', userId, 'include:', includeParam);

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const id = Number(userId);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid User ID format' }, { status: 400 });
    }

    // Build dynamic include object
    let include: Record<string, any> = {};
    if (includeParam) {
      for (const field of includeParam.split(',').map(s => s.trim())) {
        if (field) {
          // Optionally, add nested includes here if needed
          include[field] = true;
        }
      }
    }

    const candidate = await prisma.candidate.findUnique({
      where: { id },
      include,
    });

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    return NextResponse.json(candidate);
  } catch (error) {
    console.error('Error fetching candidate:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}