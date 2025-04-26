// app/api/diagnostics/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { poseData, faceData, cameraImage, screenpipeData, violations, interviewId } = await req.json();

    if (!interviewId) {
      return NextResponse.json({ error: 'Missing interviewId' }, { status: 400 });
    }

    // Convert the interviewId to a number
    const interviewIdNum = Number(interviewId);
    if (isNaN(interviewIdNum)) {
      return NextResponse.json({ error: 'Invalid interviewId format' }, { status: 400 });
    }

    // Check if the interview exists
    const interview = await prisma.interview.findUnique({
      where: { id: interviewIdNum }
    });

    if (!interview) {
      return NextResponse.json({ error: 'Interview not found' }, { status: 404 });
    }

    // Save diagnostic data to the database
    const diagnostic = await prisma.diagnostic.create({
      data: {
        poseData: poseData || undefined,
        faceData: faceData || undefined,
        cameraImage: cameraImage || undefined,
        screenpipeData: screenpipeData || undefined,
        violations: violations || undefined,
        interviewId: interviewIdNum,
      }
    });

    console.log(`Stored diagnostics for interviewId=${interviewId}, diagnosticId=${diagnostic.id}`);
    return NextResponse.json({ success: true, diagnosticId: diagnostic.id });
  } catch (err) {
    console.error('Diagnostics POST error:', err);
    return NextResponse.json({ error: 'Error saving diagnostic data' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    // Get interviewId from query parameters
    const url = new URL(req.url);
    const interviewIdParam = url.searchParams.get('interviewId');
    
    // If no interviewId is provided, return a list of all interviews with diagnostic data
    if (!interviewIdParam) {
      // Get all interviews with their diagnostic counts
      const interviewsWithDiagnostics = await prisma.interview.findMany({
        where: {
          Diagnostic: {
            some: {}
          }
        },
        select: {
          id: true,
          candidateId: true,
          mock: true,
          type: true,
          _count: {
            select: {
              Diagnostic: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return NextResponse.json({ 
        message: "No interviewId provided. Please provide an interviewId query parameter.",
        usage: {
          singleInterview: `${url.origin}/api/diagnostics?interviewId=YOUR_INTERVIEW_ID`,
        },
        availableInterviews: {
          interviews: interviewsWithDiagnostics,
          count: interviewsWithDiagnostics.length
        }
      });
    }
    
    // Convert the interviewId to a number
    const interviewId = Number(interviewIdParam);
    if (isNaN(interviewId)) {
      return NextResponse.json({ error: 'Invalid interviewId format' }, { status: 400 });
    }

    // Get diagnostics for the specified interview
    const diagnostics = await prisma.diagnostic.findMany({
      where: {
        interviewId: interviewId
      },
      orderBy: {
        timestamp: 'asc'
      }
    });
    
    // Get the interview details
    const interview = await prisma.interview.findUnique({
      where: {
        id: interviewId
      },
      select: {
        id: true,
        mock: true,
        type: true,
        candidateId: true,
        jobListingId: true,
        screenpipeRequired: true,
        terminatorRequired: true
      }
    });
    
    return NextResponse.json({ 
      interviewId,
      interviewDetails: interview,
      diagnostics: diagnostics,
      count: diagnostics.length,
      lastUpdated: diagnostics.length > 0 ? diagnostics[diagnostics.length - 1].timestamp : null
    });
  } catch (err) {
    console.error('Diagnostics GET error:', err);
    return NextResponse.json({ error: 'Error retrieving diagnostic data' }, { status: 500 });
  }
}
