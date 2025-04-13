// app/api/getCandidate/route.ts
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Extract userId from query parameters
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');
    
    console.log('Fetching recruiter with user_id:', userId); // Debugging line
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    const id = Number(userId);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid User ID format' }, { status: 400 });
    }

    const recruiter = await prisma.recruiter.findUnique({
      where: { id },
      include: {
        // Include any related data you might need
        // Example: applications: true
      }
    });
    
    if (!recruiter) {
      return NextResponse.json({ error: 'recruiter not found' }, { status: 404 });
    }

    return NextResponse.json(recruiter);
  } catch (error) {
    console.error('Error fetching recruiter:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}